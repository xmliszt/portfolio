import type { CoffeeEvent, CoffeeState, CoffeeTiming } from "./coffee-state";
import { settleCoffee } from "./settle-coffee";

/** Return the coffee state after `event` at `now`: a brew tops the flask up from its current level unless it is full or brewing, a pour moves one portion into the empty cup, and a drink empties the cup. */
export function transitionCoffee(options: {
  state: CoffeeState;
  event: CoffeeEvent;
  now: number;
  timing: CoffeeTiming;
}): CoffeeState {
  const { event, now, timing } = options;
  const state = settleCoffee(options);
  const isBrewing = state.brewStartedAt !== undefined;
  switch (event.type) {
    case "brew":
      return isBrewing || state.portions >= timing.flaskPortions
        ? state
        : { ...state, brewStartedAt: now };
    case "pour":
      return isBrewing || state.portions === 0 || state.cup.kind === "full"
        ? state
        : {
            ...state,
            portions: state.portions - 1,
            cup: { kind: "full", hotUntil: state.hotUntil ?? now },
          };
    case "drink":
      return { ...state, cup: { kind: "empty" } };
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}
