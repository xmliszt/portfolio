import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { CoffeePhase } from "./get-coffee-phase";

export type CoffeeControl = "switch";

/** Return the `label`, `tooltip` and whether pressing the coffee machine's switch does anything in `phase`. */
export function describeCoffeeSwitch(options: {
  phase: CoffeePhase;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.coffee;
  switch (options.phase.kind) {
    case "idle":
      return {
        label: copy.idleSwitchLabel,
        tooltip: copy.idleSwitchTooltip,
        enabled: true,
      };
    case "brewing":
      return {
        label: copy.brewingSwitchLabel,
        tooltip: copy.brewingTooltip,
        enabled: false,
      };
    case "hot":
      return {
        label: copy.hotSwitchLabel,
        tooltip: copy.hotSwitchTooltip,
        enabled: true,
      };
    default: {
      const unhandled: never = options.phase;
      return unhandled;
    }
  }
}
