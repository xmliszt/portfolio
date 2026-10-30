import type { SimCat } from "./sim-types";

/** Lift every paw of `cat` that is reaching for something, so its legs go back to walking. */
export function releasePaws(cat: SimCat) {
  for (const leg of cat.legs) leg.reach = undefined;
}
