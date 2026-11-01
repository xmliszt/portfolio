import type { ToyTrail } from "@/lib/paws/wire-types";

import type { World } from "./sim-types";

/** Return the trail of every toy in `world` that has laid one. */
export function getToyTrails(world: World): ToyTrail[] {
  return world.toys.flatMap((toy) => {
    const points = world.trails[toy.id];
    return points === undefined || points.length === 0
      ? []
      : [{ toyId: toy.id, points }];
  });
}
