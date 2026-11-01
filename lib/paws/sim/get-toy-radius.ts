import type { ToySnapshot } from "@/lib/paws/wire-types";

import { TOY_LIMITS } from "./toy-limits";

const SMALLEST_BALL = 0.2;

/** Return how far `toy` reaches from its middle on the glass, in world units: a yarn ball shrinks with the cube root of the thread `left` on it. */
export function getToyRadius(toy: ToySnapshot) {
  if (toy.kind !== "yarn") return TOY_LIMITS.radius[toy.kind];
  return TOY_LIMITS.radius.yarn * Math.max(SMALLEST_BALL, Math.cbrt(toy.left));
}
