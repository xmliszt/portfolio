import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import { formatClockTime } from "@/lib/laundromat/laundry/format-clock-time";

import type { CoffeeCup } from "./coffee-state";
import type { CoffeePhase } from "./get-coffee-phase";

/** Return the `label`, `tooltip` and whether pressing the coffee flask pours a cup, given the flask's `phase` and the `cup` on the table. */
export function describeCoffeeFlask(options: {
  phase: CoffeePhase;
  cup: CoffeeCup;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.coffee;
  switch (options.phase.kind) {
    case "empty":
      return {
        label: copy.emptyFlaskLabel,
        tooltip: copy.emptyFlaskTooltip,
        enabled: false,
      };
    case "brewing":
      return {
        ...(options.phase.isSomeoneElse
          ? {
              label: copy.othersBrewingFlaskLabel,
              tooltip: copy.othersBrewingTooltip({
                time: formatClockTime({
                  timestampMs: options.phase.doneAt,
                  locale: options.copy.locale,
                }),
              }),
            }
          : { label: copy.brewingFlaskLabel, tooltip: copy.brewingTooltip }),
        enabled: false,
      };
    case "ready":
      return options.cup.kind === "full"
        ? {
            label: copy.cupFullFlaskLabel,
            tooltip: copy.cupFullFlaskTooltip,
            enabled: false,
          }
        : { label: copy.pourLabel, tooltip: copy.pourTooltip, enabled: true };
    default: {
      const unhandled: never = options.phase;
      return unhandled;
    }
  }
}
