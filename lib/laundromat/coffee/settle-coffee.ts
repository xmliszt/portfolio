import type { CoffeeState, CoffeeTiming } from "./coffee-state";

/** Return `state` with a brew that has finished by `now` turned into a full, hot flask; any other state comes back unchanged. */
export function settleCoffee(options: {
  state: CoffeeState;
  now: number;
  timing: CoffeeTiming;
}): CoffeeState {
  const { state, now, timing } = options;
  if (state.brewStartedAt === undefined) return state;
  const doneAt =
    state.brewStartedAt +
    ((timing.flaskPortions - state.portions) / timing.flaskPortions) *
      timing.brewMs;
  if (now < doneAt) return state;
  return {
    ...state,
    portions: timing.flaskPortions,
    brewStartedAt: undefined,
    hotUntil: doneAt + timing.hotMs,
  };
}
