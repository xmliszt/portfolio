import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { BasketContents } from "./get-basket-contents";

/** Return the welcome mat's `label` and `tooltip`, and `ready` when the basket holds washed or dried laundry that can be taken home. */
export function describeEntranceMat(options: {
  basket: BasketContents;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.entranceMat;
  switch (options.basket) {
    case "wet":
    case "folded":
      return {
        label: copy.readyLabel({ laundry: options.basket }),
        tooltip: copy.readyTooltip,
        ready: true,
      };
    case "dirty":
    case "empty":
      return {
        label: copy.waitingLabel,
        tooltip: copy.waitingTooltip,
        ready: false,
      };
    default: {
      const unhandled: never = options.basket;
      return unhandled;
    }
  }
}
