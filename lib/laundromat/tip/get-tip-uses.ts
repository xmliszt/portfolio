import { TIP_USE_TIERS } from "./tip-amounts";

/** Return how many times the token from a tip of `cents` can be dropped into a machine. */
export function getTipUses(cents: number) {
  return TIP_USE_TIERS.find(({ minCents }) => cents >= minCents)?.uses ?? 1;
}
