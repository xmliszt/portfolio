import type { CatLook } from "@/lib/paws/cat-look";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { blendPose } from "@/lib/paws/sim/blend-pose";
import { createSimCat } from "@/lib/paws/sim/create-sim-cat";
import { createWorld } from "@/lib/paws/sim/create-world";
import { damp } from "@/lib/paws/sim/damp";
import { getCatBuild } from "@/lib/paws/sim/get-cat-build";
import type { Tick, World } from "@/lib/paws/sim/sim-types";
import { toLegSnapshot } from "@/lib/paws/sim/to-leg-snapshot";
import { updateCatLegs } from "@/lib/paws/sim/update-cat-legs";
import type {
  CatActivity,
  CatSnapshot,
  PawPrintEvent,
} from "@/lib/paws/wire-types";

const REACHING_ACTIVITIES = new Set<CatActivity>(["paw", "bat"]);
const REACHING_MAX_SPEED = 20;
const JUMP_DISTANCE = 200;
const HOST_LEG_RATE = 20;
/** How long the host's prints of a cat still count after its legs stop coming from the host: one cats message plus the render delay, so prints sent in the same message as the switch are kept. */
const HOST_PRINT_GRACE_SECONDS =
  (1000 / ROOM_LIMITS.catSnapshotsPerSecond + ROOM_LIMITS.renderDelayMs) / 1000;

/** Return a stepper that walks the legs of the host's cats on this screen from each cat's played-back body, keeping the host's legs while a cat stands still to reach for a finger or a tail. */
export function createLegPlayer(options: { random: () => number }) {
  const state: { world: World; hostLegsAt: { [userId: string]: number } } = {
    world: createWorld({ random: options.random }),
    hostLegsAt: {},
  };

  return {
    /** Return `snapshots` with legs stepped on this screen, the paw prints of those steps, and the cats whose host prints to keep. */
    step(stepOptions: {
      snapshots: CatSnapshot[];
      lookOf: (userId: string) => CatLook | undefined;
      dtSeconds: number;
    }) {
      const { world } = state;
      const tick: Tick = {
        world,
        dtSeconds: stepOptions.dtSeconds,
        events: [],
      };
      world.time += stepOptions.dtSeconds;
      const ids = new Set(
        stepOptions.snapshots.map((snapshot) => snapshot.userId)
      );
      for (const userId of Object.keys(world.cats)) {
        if (ids.has(userId)) continue;
        delete world.cats[userId];
        delete state.hostLegsAt[userId];
      }
      const snapshots = stepOptions.snapshots.map((snapshot): CatSnapshot => {
        const look = stepOptions.lookOf(snapshot.userId);
        if (look === undefined) return snapshot;
        const existing = world.cats[snapshot.userId];
        if (
          existing === undefined ||
          Math.hypot(existing.x - snapshot.x, existing.y - snapshot.y) >
            JUMP_DISTANCE
        ) {
          world.cats[snapshot.userId] = createSimCat({
            world,
            userId: snapshot.userId,
            look,
            snapshot,
          });
        }
        const cat = world.cats[snapshot.userId];
        if (cat.look !== look) {
          cat.look = look;
          cat.build = getCatBuild(look);
        }
        cat.x = snapshot.x;
        cat.y = snapshot.y;
        cat.heading = snapshot.heading;
        cat.speed = snapshot.speed;
        cat.bend = snapshot.bend;
        cat.weights = { ...snapshot.pose };
        cat.pose = blendPose(cat.weights);
        const isReaching =
          REACHING_ACTIVITIES.has(snapshot.activity) &&
          snapshot.speed / cat.build.scale < REACHING_MAX_SPEED;
        if (isReaching) {
          state.hostLegsAt[snapshot.userId] = world.time;
          cat.legs.forEach((leg, index) => {
            const hostLeg = snapshot.legs[index];
            const follow = (from: number, to: number) =>
              damp({
                from,
                to,
                rate: HOST_LEG_RATE,
                dtSeconds: stepOptions.dtSeconds,
              });
            leg.swing = undefined;
            leg.x = follow(leg.x, hostLeg.x);
            leg.y = follow(leg.y, hostLeg.y);
            leg.h = follow(leg.h, hostLeg.h);
          });
        } else {
          updateCatLegs({ tick, cat });
        }
        return {
          ...snapshot,
          legs: [
            toLegSnapshot(cat.legs[0]),
            toLegSnapshot(cat.legs[1]),
            toLegSnapshot(cat.legs[2]),
            toLegSnapshot(cat.legs[3]),
          ],
        };
      });
      return {
        snapshots,
        prints: tick.events.filter(
          (event): event is PawPrintEvent => event.kind === "pawPrint"
        ),
        hostLegIds: new Set(
          Object.entries(state.hostLegsAt)
            .filter(
              ([, usedAt]) => world.time - usedAt <= HOST_PRINT_GRACE_SECONDS
            )
            .map(([userId]) => userId)
        ),
      };
    },
    /** Forget every cat's legs, so the next `step` starts them from the snapshots. */
    reset() {
      state.world = createWorld({ random: options.random });
      state.hostLegsAt = {};
    },
  };
}
