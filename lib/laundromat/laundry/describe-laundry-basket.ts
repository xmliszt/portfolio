import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { BasketContents } from "./get-basket-contents";

/** Return the laundromat basket's `label` and `tooltip` for what it holds. */
export function describeLaundryBasket(options: {
  basket: BasketContents;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.laundryBasket;
  return {
    label: copy.labels[options.basket],
    tooltip: copy.tooltips[options.basket],
  };
}
