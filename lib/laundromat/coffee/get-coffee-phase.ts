import type { CoffeeState, CoffeeTiming } from "./coffee-state";
import { settleCoffee } from "./settle-coffee";

export type CoffeePhase =
  | { kind: "empty" }
  | { kind: "brewing"; level: number }
  | { kind: "ready"; level: number; full: boolean; hot: boolean };

/** Return whether the flask in `state` is empty, brewing or holding coffee at `now`, with its 0–1 fill `level`. */
export function getCoffeePhase(options: {
  state: CoffeeState;
  now: number;
  timing: CoffeeTiming;
}): CoffeePhase {
  const { now, timing } = options;
  const state = settleCoffee(options);
  const { flaskPortions } = timing;
  if (state.brewStartedAt !== undefined) {
    const brewMs =
      ((flaskPortions - state.portions) / flaskPortions) * timing.brewMs;
    const progress = Math.max(0, (now - state.brewStartedAt) / brewMs);
    return {
      kind: "brewing",
      level: Math.min(
        1,
        (state.portions + (flaskPortions - state.portions) * progress) /
          flaskPortions
      ),
    };
  }
  if (state.portions === 0) return { kind: "empty" };
  return {
    kind: "ready",
    level: Math.min(1, state.portions / flaskPortions),
    full: state.portions >= flaskPortions,
    hot: state.hotUntil !== undefined && now < state.hotUntil,
  };
}
