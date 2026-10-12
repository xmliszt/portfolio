import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import { formatClockTime } from "@/lib/laundromat/laundry/format-clock-time";

import type { CoffeePhase } from "./get-coffee-phase";

export type CoffeeControl = "switch" | "flask";

/** Return the `label`, `tooltip` and whether pressing the coffee machine's switch does anything in `phase`. */
export function describeCoffeeSwitch(options: {
  phase: CoffeePhase;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.coffee;
  switch (options.phase.kind) {
    case "empty":
      return {
        label: copy.idleSwitchLabel,
        tooltip: copy.idleSwitchTooltip,
        enabled: true,
      };
    case "brewing":
      return {
        ...(options.phase.isSomeoneElse
          ? {
              label: copy.othersBrewingSwitchLabel,
              tooltip: copy.othersBrewingTooltip({
                time: formatClockTime({
                  timestampMs: options.phase.doneAt,
                  locale: options.copy.locale,
                }),
              }),
            }
          : { label: copy.brewingSwitchLabel, tooltip: copy.brewingTooltip }),
        enabled: false,
      };
    case "ready":
      return options.phase.full
        ? {
            label: copy.fullSwitchLabel,
            tooltip: copy.fullSwitchTooltip,
            enabled: false,
          }
        : {
            label: copy.topUpSwitchLabel,
            tooltip: copy.topUpSwitchTooltip,
            enabled: true,
          };
    default: {
      const unhandled: never = options.phase;
      return unhandled;
    }
  }
}
