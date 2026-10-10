import type { CoffeePhase } from "./get-coffee-phase";

export type CoffeeControl = "switch";

/** Return the `label`, `tooltip` and whether pressing the coffee machine's switch does anything in `phase`. */
export function describeCoffeeSwitch(phase: CoffeePhase) {
  switch (phase.kind) {
    case "idle":
      return {
        label: "Coffee machine switch, brew a coffee",
        tooltip: "brew a coffee",
        enabled: true,
      };
    case "brewing":
      return {
        label: "Coffee machine switch, brewing",
        tooltip: "brewing…",
        enabled: false,
      };
    case "hot":
      return {
        label: "Coffee machine switch, brew another coffee",
        tooltip: "brew another",
        enabled: true,
      };
    default: {
      const unhandled: never = phase;
      return unhandled;
    }
  }
}
