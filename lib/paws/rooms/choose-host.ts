import type { PlayerPresence } from "@/lib/paws/wire-types";

/** Return the `connectionId` of the player who joined earliest, ties going to the smaller `connectionId`, or `undefined` when there are no players. */
export function chooseHost(players: PlayerPresence[]) {
  return players
    .toSorted(
      (a, b) =>
        a.joinedAt - b.joinedAt ||
        (a.connectionId < b.connectionId
          ? -1
          : a.connectionId > b.connectionId
            ? 1
            : 0)
    )
    .at(0)?.connectionId;
}
