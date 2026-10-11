import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { CoffeePhase } from "./get-coffee-phase";

/** Return the hit target `label` and `tooltip` for the body of the coffee machine in `phase`. */
export function describeCoffeeMachine(options: {
  phase: CoffeePhase;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.coffee;
  switch (options.phase.kind) {
    case "empty":
      return { label: copy.machineLabel, tooltip: undefined };
    case "brewing":
      return { label: copy.brewingMachineLabel, tooltip: copy.brewingTooltip };
    case "ready":
      return {
        label: copy.readyMachineLabel,
        tooltip: copy.readyMachineTooltip,
      };
    default: {
      const unhandled: never = options.phase;
      return unhandled;
    }
  }
}
