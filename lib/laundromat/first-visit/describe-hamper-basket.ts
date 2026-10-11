import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

/** Return the basket's tooltip for `count` of `total` garments in it. */
export function describeHamperBasket(options: {
  count: number;
  total: number;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.firstVisit;
  if (options.count === 0) return copy.basketEmpty;
  if (options.count < options.total) {
    return copy.basketPartial({ count: options.count, total: options.total });
  }
  return copy.basketFull;
}
