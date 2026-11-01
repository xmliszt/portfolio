import type { ToySnapshot } from "@/lib/paws/wire-types";

import { getBoxGap } from "./get-box-gap";
import { getToyRadius } from "./get-toy-radius";

/** Return the space between the edges of toys `a` and `b` on the glass, in world units, negative when they overlap; a box counts by its walls and every other toy as a disc of its radius. */
export function getToyGap(options: { a: ToySnapshot; b: ToySnapshot }) {
  const { a, b } = options;
  if (a.kind === "box" && b.kind === "box")
    return Math.hypot(a.x - b.x, a.y - b.y) - 2 * getToyRadius(a);
  if (a.kind === "box")
    return getBoxGap({ box: a, x: b.x, y: b.y }) - getToyRadius(b);
  if (b.kind === "box")
    return getBoxGap({ box: b, x: a.x, y: a.y }) - getToyRadius(a);
  return Math.hypot(a.x - b.x, a.y - b.y) - getToyRadius(a) - getToyRadius(b);
}
