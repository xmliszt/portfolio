import type { SimCat } from "./sim-types";

/** Return `true` if `cat` is walking or running off the glass; `false` otherwise. */
export function isCatLeaving(cat: SimCat) {
  return cat.state === "leave" || cat.state === "flee";
}
