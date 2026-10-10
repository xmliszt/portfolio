import type { CoffeePhase } from "./get-coffee-phase";

/** Return the hit target `label` and `tooltip` for the body of the coffee machine in `phase`. */
export function describeCoffeeMachine(phase: CoffeePhase) {
  switch (phase.kind) {
    case "idle":
      return { label: "Coffee machine", tooltip: undefined };
    case "brewing":
      return { label: "Coffee machine, brewing", tooltip: "brewing…" };
    case "hot":
      return {
        label: "Coffee machine, a hot coffee is on the table",
        tooltip: "coffee's on the table",
      };
    default: {
      const unhandled: never = phase;
      return unhandled;
    }
  }
}
