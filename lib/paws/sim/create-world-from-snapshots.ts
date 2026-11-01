import type {
  CatSnapshot,
  PlayerPresence,
  ToySnapshot,
  ToyTrail,
} from "@/lib/paws/wire-types";

import { createSimCat } from "./create-sim-cat";
import { createWorld } from "./create-world";
import { restoreCatActivity } from "./restore-cat-activity";

/** Return a room that carries on from the latest `snapshots` of the players still in `players` and with `toys` and their `trails`, so the next screen to run the room continues where the host stopped. */
export function createWorldFromSnapshots(options: {
  random: () => number;
  snapshots: CatSnapshot[];
  players: Pick<PlayerPresence, "userId" | "look">[];
  toys: ToySnapshot[];
  trails: ToyTrail[];
}) {
  const world = {
    ...createWorld({ random: options.random }),
    toys: options.toys.map((toy) => ({
      ...toy,
      vx: 0,
      vy: 0,
      vh: 0,
    })),
    trails: Object.fromEntries(
      options.trails.map((trail) => [trail.toyId, trail.points])
    ),
  };
  for (const snapshot of options.snapshots) {
    const player = options.players.find(
      (candidate) => candidate.userId === snapshot.userId
    );
    if (player === undefined) continue;
    const cat = createSimCat({
      world,
      userId: player.userId,
      look: player.look,
      snapshot,
    });
    world.cats[cat.userId] = cat;
    restoreCatActivity({ world, cat, activity: snapshot.activity });
  }
  return world;
}
