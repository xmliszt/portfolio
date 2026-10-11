import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { CoffeeCup } from "./coffee-state";

/** Return the hit target `label` and `tooltip` for the coffee cup on the table, full or empty. */
export function describeCoffeeCup(options: {
  cup: CoffeeCup;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.coffee;
  return options.cup.kind === "full"
    ? { label: copy.fullCupLabel, tooltip: copy.fullCupTooltip }
    : { label: copy.emptyCupLabel, tooltip: copy.emptyCupTooltip };
}
