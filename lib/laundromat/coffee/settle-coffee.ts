import type { CoffeeFlask, CoffeeTiming } from "./coffee-state";

/** Return `flask` with a brew that has finished by `now` turned into a full, hot flask, keeping its `changedAt`; any other flask comes back unchanged. */
export function settleCoffee(options: {
  flask: CoffeeFlask;
  now: number;
  timing: CoffeeTiming;
}): CoffeeFlask {
  const { flask, now, timing } = options;
  if (flask.brewStartedAt === undefined) return flask;
  const doneAt =
    flask.brewStartedAt +
    ((timing.flaskPortions - flask.portions) / timing.flaskPortions) *
      timing.brewMs;
  if (now < doneAt) return flask;
  return {
    ...flask,
    portions: timing.flaskPortions,
    brewStartedAt: undefined,
    hotUntil: doneAt + timing.hotMs,
  };
}
