import type { SimCat } from "./sim-types";

/** Return `true` if `cat` is on or walking onto the glass; `false` while it waits off the edge. */
export function isCatOnstage(cat: SimCat) {
  return cat.state !== "offstage";
}
