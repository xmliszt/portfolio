import type { CatSnapshot, PlayerPresence } from "@/lib/paws/wire-types";

import { createSimCat } from "./create-sim-cat";
import { createWorld } from "./create-world";
import { restoreCatActivity } from "./restore-cat-activity";

/** Return a room that carries on from the latest `snapshots` of the players still in `players`, so the next screen to run the cats continues where the host stopped. */
export function createWorldFromSnapshots(options: {
  random: () => number;
  snapshots: CatSnapshot[];
  players: Pick<PlayerPresence, "userId" | "look">[];
}) {
  const world = createWorld({ random: options.random });
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
