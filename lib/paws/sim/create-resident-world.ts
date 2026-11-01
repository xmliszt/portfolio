import type {
  PlayerPresence,
  ToySnapshot,
  ToyTrail,
} from "@/lib/paws/wire-types";

import { createSimCat } from "./create-sim-cat";
import { createToys } from "./create-toys";
import { createWorld } from "./create-world";
import { pickRandomSpot } from "./pick-random-spot";
import { placeLegsAtRest } from "./place-legs-at-rest";
import { restoreCatActivity } from "./restore-cat-activity";

/** Return a new room with `toys` and their `trails`, or boxes and bowls at random spots when `toys` is not given, and a cat for each of `players` already standing at a free spot on the glass, pausing before it wanders. */
export function createResidentWorld(options: {
  random: () => number;
  players: Pick<PlayerPresence, "userId" | "look">[];
  toys?: ToySnapshot[];
  trails?: ToyTrail[];
}) {
  const empty = createWorld({ random: options.random });
  const world = {
    ...empty,
    toys:
      options.toys === undefined
        ? createToys({ random: options.random, world: empty })
        : options.toys.map((toy) => ({
            ...toy,
            vx: 0,
            vy: 0,
            vh: 0,
          })),
    trails: Object.fromEntries(
      (options.trails ?? []).map((trail) => [trail.toyId, trail.points])
    ),
  };
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
