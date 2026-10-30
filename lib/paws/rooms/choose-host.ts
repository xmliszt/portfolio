import type { PlayerPresence } from "@/lib/paws/wire-types";

/** Return the `userId` of the player who joined earliest, ties going to the smaller `userId`, or `undefined` when there are no players. */
export function chooseHost(players: PlayerPresence[]) {
  return players
    .toSorted(
      (a, b) =>
        a.joinedAt - b.joinedAt ||
        (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0)
    )
    .at(0)?.userId;
}
