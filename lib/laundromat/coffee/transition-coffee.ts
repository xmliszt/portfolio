import type { CoffeeEvent, CoffeeState, CoffeeTiming } from "./coffee-state";
import { settleCoffee } from "./settle-coffee";

/** Return the coffee state after `event` at `now`: a brew by `visitorId` tops the flask up from its current level unless it is full or brewing, a pour moves one portion into the empty cup, and a drink empties the cup; a brew or pour stamps the flask's `changedAt` with `now`, or just after the flask's own `changedAt` when that is later. */
export function transitionCoffee(options: {
  state: CoffeeState;
  event: CoffeeEvent;
  now: number;
  timing: CoffeeTiming;
  visitorId: string | undefined;
}): CoffeeState {
  const { state, event, now, timing } = options;
  const flask = settleCoffee({ flask: state.flask, now, timing });
  const settled = { ...state, flask };
  const isBrewing = flask.brewStartedAt !== undefined;
  // Another tab's clock may run ahead, so an action must still outrank the flask it acted on.
  const changedAt = Math.max(now, (flask.changedAt ?? 0) + 1);
  switch (event.type) {
    case "brew":
      return isBrewing || flask.portions >= timing.flaskPortions
        ? settled
        : {
            ...settled,
            flask: {
              ...flask,
              brewStartedAt: now,
              brewedBy: options.visitorId,
              changedAt,
            },
          };
    case "pour":
      return isBrewing || flask.portions === 0 || state.cup.kind === "full"
        ? settled
        : {
            flask: { ...flask, portions: flask.portions - 1, changedAt },
            cup: { kind: "full", hotUntil: flask.hotUntil ?? now },
          };
    case "drink":
      return { ...settled, cup: { kind: "empty" } };
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}
