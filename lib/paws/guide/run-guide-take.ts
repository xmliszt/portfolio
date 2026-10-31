import { pruneScenePrints } from "@/lib/paws/render/prune-scene-prints";
import type {
  FingertipKind,
  FingertipState,
  ScenePrint,
} from "@/lib/paws/render/render-types";
import { stepFingertip } from "@/lib/paws/render/step-fingertip";
import { toScenePrint } from "@/lib/paws/render/to-scene-print";
import { createResidentWorld } from "@/lib/paws/sim/create-resident-world";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { damp } from "@/lib/paws/sim/damp";
import { getCatSnapshots } from "@/lib/paws/sim/get-cat-snapshots";
import { isCatOnstage } from "@/lib/paws/sim/is-cat-onstage";
import { stepWorld } from "@/lib/paws/sim/step-world";
import type { RoomEvent } from "@/lib/paws/wire-types";

import { GUIDE_FADE_SECONDS } from "./guide-fade-seconds";
import type { GuideFrame, GuideTake } from "./guide-types";

const STEPS_PER_SECOND = 60;
const LEAD_SECONDS = 1;
const CAMERA_RATE = 2.5;
const SHOWN_VISIBILITY = 0.3;
const PRINT_PRESS = 0.2;

/** Run `take` through the real room simulation from a second before its clock starts until its fade ends, and return every step from clock 0 at 60 steps a second. */
export function runGuideTake(take: GuideTake) {
  const world = createResidentWorld({
    random: createSeededRandom({ seed: take.seed }),
    players: take.cats,
  });
  take.setup?.(world);
  const dtSeconds = 1 / STEPS_PER_SECOND;
  const fingers = take.fingers ?? [];
  const tips: { [userId: string]: FingertipState | undefined } = {};
  const wasPressed: { [userId: string]: boolean | undefined } = {};
  const pending = (take.directions ?? []).toSorted((a, b) => a.at - b.at);
  const state: {
    prints: ScenePrint[];
    camera: { x: number; y: number } | undefined;
    nextDirection: number;
  } = { prints: [], camera: undefined, nextDirection: 0 };
  const firstStep = -LEAD_SECONDS * STEPS_PER_SECOND;
  const lastStep = Math.round(
    (take.loopSeconds + GUIDE_FADE_SECONDS) * STEPS_PER_SECOND
  );
  const looks = Object.fromEntries(
    take.cats.map((cat) => [cat.userId, cat.look])
  );

  function cameraTarget() {
    const camera = take.camera;
    switch (camera.kind) {
      case "fixed":
        return { x: camera.x, y: camera.y };
      case "follow": {
        const points = camera.ids.flatMap((id) => {
          const cat = world.cats[id];
          if (cat !== undefined && isCatOnstage(cat))
            return [{ x: cat.x, y: cat.y }];
          const tip = tips[id];
          return tip !== undefined && tip.visibility > SHOWN_VISIBILITY
            ? [{ x: tip.x, y: tip.y }]
            : [];
        });
        if (points.length === 0) return state.camera;
        return {
          x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
          y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
        };
      }
      default: {
        const unknown: never = camera;
        return unknown;
      }
    }
  }

  const frames: GuideFrame[] = [];
  for (let step = firstStep; step <= lastStep; step++) {
    const t = step / STEPS_PER_SECOND;
    while ((pending.at(state.nextDirection)?.at ?? Infinity) <= t) {
      pending.at(state.nextDirection)?.run(world);
      state.nextDirection += 1;
    }
    const inputs = fingers.map((finger) => ({ finger, point: finger.at(t) }));
    const { events } = stepWorld({
      world,
      players: take.cats,
      fingers: inputs.flatMap(({ finger, point }) =>
        point === undefined ? [] : [{ userId: finger.userId, ...point }]
      ),
      dtSeconds,
    });
    const fingerPrints: RoomEvent[] = [];
    const sceneFingers = inputs.map(({ finger, point }) => {
      const previous = tips[finger.userId];
      const tip = stepFingertip({
        fingertip: previous,
        input: {
          x: point?.x ?? previous?.x ?? 0,
          y: point?.y ?? previous?.y ?? 0,
          present: point !== undefined,
          pressed: point?.pressed ?? false,
        },
        dtSeconds,
      });
      tips[finger.userId] = tip;
      const isPressed = point?.pressed ?? false;
      if (wasPressed[finger.userId] && !isPressed && tip.press >= PRINT_PRESS)
        fingerPrints.push({
          kind: "fingerPrint",
          userId: finger.userId,
          x: tip.x,
          y: tip.y,
          pressure: tip.press,
        });
      wasPressed[finger.userId] = isPressed;
      const kind: FingertipKind = finger.own ? "own" : "remote";
      return { ...tip, kind, userId: finger.userId };
    });
    const born = [...events, ...fingerPrints].flatMap((event) => {
      const print = toScenePrint({
        event,
        look: "userId" in event ? looks[event.userId] : undefined,
        time: t,
      });
      return print === undefined ? [] : [print];
    });
    state.prints = pruneScenePrints({
      prints: [...state.prints, ...born],
      time: t,
    });
    const target = cameraTarget() ?? {
      x: world.width / 2,
      y: world.height / 2,
    };
    state.camera =
      state.camera === undefined
        ? target
        : {
            x: damp({
              from: state.camera.x,
              to: target.x,
              rate: CAMERA_RATE,
              dtSeconds,
            }),
            y: damp({
              from: state.camera.y,
              to: target.y,
              rate: CAMERA_RATE,
              dtSeconds,
            }),
          };
    if (step >= 0)
      frames.push({
        cats: getCatSnapshots(world),
        fingers: sceneFingers,
        prints: state.prints,
        time: t,
        camera: state.camera,
      });
  }
  return frames;
}
