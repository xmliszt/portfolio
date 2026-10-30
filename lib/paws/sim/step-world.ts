import type { PlayerPresence } from "@/lib/paws/wire-types";

import { createSimCat } from "./create-sim-cat";
import { getCatBuild } from "./get-cat-build";
import { moveCatBody } from "./move-cat-body";
import { separateCats } from "./separate-cats";
import type { FingerInput, Tick, World } from "./sim-types";
import { spawnCat } from "./spawn-cat";
import { updateAttention } from "./update-attention";
import { updateBrain } from "./update-brain";
import { updateCatLegs } from "./update-cat-legs";
import { updateCatPose } from "./update-cat-pose";
import { updateFingers } from "./update-fingers";

/** Advance `world` by `dtSeconds`: bring in cats of new `players`, send off cats whose players left, react to `fingers`, and return the room events that happened. */
export function stepWorld(options: {
  world: World;
  players: Pick<PlayerPresence, "userId" | "look">[];
  fingers: FingerInput[];
  dtSeconds: number;
}) {
  const { world, players, dtSeconds } = options;
  const tick: Tick = { world, dtSeconds, events: [] };
  world.time += dtSeconds;

  for (const player of players) {
    const existing = world.cats[player.userId];
    if (existing === undefined) {
      const cat = createSimCat({
        world,
        userId: player.userId,
        look: player.look,
      });
      world.cats[cat.userId] = cat;
      spawnCat({ world, cat });
      continue;
    }
    existing.isDeparting = false;
    if (existing.look !== player.look) {
      existing.look = player.look;
      existing.build = getCatBuild(player.look);
    }
  }
  const playerIds = new Set(players.map((player) => player.userId));
  for (const cat of Object.values(world.cats)) {
    if (!playerIds.has(cat.userId)) cat.isDeparting = true;
  }

  updateFingers({ world, inputs: options.fingers, dtSeconds });
  updateAttention(tick);
  for (const cat of Object.values(world.cats)) {
    updateBrain({ tick, cat });
    moveCatBody({ cat, dtSeconds });
    updateCatPose({ tick, cat });
    updateCatLegs({ tick, cat });
  }
  separateCats(world);
  for (const cat of Object.values(world.cats)) {
    if (cat.isDeparting && cat.state === "offstage")
      delete world.cats[cat.userId];
  }
  return { events: tick.events };
}
