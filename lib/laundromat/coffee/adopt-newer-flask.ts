import type { RemoteFlask } from "@/lib/laundromat/realtime/room-presence";

import type { CoffeeFlask } from "./coffee-state";

function getContentsKey(flask: CoffeeFlask) {
  return [
    flask.portions,
    flask.brewStartedAt ?? -1,
    flask.hotUntil ?? -1,
    flask.brewedBy ?? "",
  ].join("|");
}

function isLater(options: { flask: CoffeeFlask; than: CoffeeFlask }) {
  const changedAt = options.flask.changedAt ?? -Infinity;
  const thanChangedAt = options.than.changedAt ?? -Infinity;
  if (changedAt !== thanChangedAt) return changedAt > thanChangedAt;
  return getContentsKey(options.flask) > getContentsKey(options.than);
}

/** Return the latest flask among `flask` and `others`, ordered by `changedAt` and then by contents so every tab picks the same one on a tie, with `portions` capped at `maxPortions`; `flask` itself comes back when none of `others` is later. */
export function adoptNewerFlask(options: {
  flask: CoffeeFlask;
  others: RemoteFlask[];
  maxPortions: number;
}): CoffeeFlask {
  return options.others
    .map(
      (other): CoffeeFlask => ({
        portions: Math.min(other.portions, options.maxPortions),
        brewStartedAt: other.brewStartedAt,
        hotUntil: other.hotUntil,
        brewedBy: other.brewedBy,
        changedAt: other.changedAt,
      })
    )
    .reduce(
      (latest, other) =>
        isLater({ flask: other, than: latest }) ? other : latest,
      options.flask
    );
}
