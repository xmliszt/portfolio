import type { CoffeeFlask, CoffeeTiming } from "./coffee-state";
import { settleCoffee } from "./settle-coffee";

export type CoffeePhase =
  | { kind: "empty" }
  | { kind: "brewing"; level: number; doneAt: number; isSomeoneElse: boolean }
  | { kind: "ready"; level: number; full: boolean; hot: boolean };

/** Return whether `flask` is empty, brewing or holding coffee at `now`, with its 0–1 fill `level`, and while brewing, when it is done and whether a visitor other than `ownVisitorId` started the brew. */
export function getCoffeePhase(options: {
  flask: CoffeeFlask;
  now: number;
  timing: CoffeeTiming;
  ownVisitorId: string | undefined;
}): CoffeePhase {
  const { now, timing } = options;
  const flask = settleCoffee(options);
  const { flaskPortions } = timing;
  if (flask.brewStartedAt !== undefined) {
    const brewMs =
      ((flaskPortions - flask.portions) / flaskPortions) * timing.brewMs;
    const progress = Math.max(0, (now - flask.brewStartedAt) / brewMs);
    return {
      kind: "brewing",
      doneAt: flask.brewStartedAt + brewMs,
      isSomeoneElse:
        flask.brewedBy !== undefined && flask.brewedBy !== options.ownVisitorId,
      level: Math.min(
        1,
        (flask.portions + (flaskPortions - flask.portions) * progress) /
          flaskPortions
      ),
    };
  }
  if (flask.portions === 0) return { kind: "empty" };
  return {
    kind: "ready",
    level: Math.min(1, flask.portions / flaskPortions),
    full: flask.portions >= flaskPortions,
    hot: flask.hotUntil !== undefined && now < flask.hotUntil,
  };
}
