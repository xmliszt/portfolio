import type { ToySnapshot } from "@/lib/paws/wire-types";

import { TOY_LIMITS } from "./toy-limits";

/** `true` if `toy` is a yarn ball with no thread `left` or a roll unrolled to `TOY_LIMITS.maxUnrolled`; `false` for every toy cats can still play with. */
export function isToyUsedUp(toy: ToySnapshot) {
  if (toy.kind === "yarn") return toy.left <= 0;
  if (toy.kind === "roll") return toy.unrolled >= TOY_LIMITS.maxUnrolled;
  return false;
}
