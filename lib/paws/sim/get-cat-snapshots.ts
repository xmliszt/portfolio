import { isCatOnstage } from "./is-cat-onstage";
import type { World } from "./sim-types";
import { toCatSnapshot } from "./to-cat-snapshot";

/** Return a snapshot of every cat on the glass in `world`; cats waiting off the edge are left out. */
export function getCatSnapshots(world: World) {
  return Object.values(world.cats).filter(isCatOnstage).map(toCatSnapshot);
}
