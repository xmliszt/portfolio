import type { PlayerPresence } from "@/lib/paws/wire-types";

import { createSimCat } from "./create-sim-cat";
import { createWorld } from "./create-world";
import { pickRandomSpot } from "./pick-random-spot";
import { placeLegsAtRest } from "./place-legs-at-rest";
import { restoreCatActivity } from "./restore-cat-activity";

/** Return a new room with a cat for each of `players` already standing at a free spot on the glass, pausing before it wanders. */
export function createResidentWorld(options: {
  random: () => number;
  players: Pick<PlayerPresence, "userId" | "look">[];
}) {
  const world = createWorld({ random: options.random });
  for (const player of options.players) {
    const cat = createSimCat({
      world,
      userId: player.userId,
      look: player.look,
    });
    const spot = pickRandomSpot({ world, cat });
    cat.x = spot.x;
    cat.y = spot.y;
    cat.heading = world.random() * Math.PI * 2;
    placeLegsAtRest(cat);
    world.cats[cat.userId] = cat;
    restoreCatActivity({ world, cat, activity: "pause" });
  }
  return world;
}
