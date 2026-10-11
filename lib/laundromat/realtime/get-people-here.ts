import type { RoomPresence } from "./room-presence";

/** Return how many different visitors are in the room, the distinct `visitorId`s among `peers` plus `ownVisitorId`, or `undefined` until the room has synced presence or while `ownVisitorId` is unknown. */
export function getPeopleHere(options: {
  isSynced: boolean;
  peers: Pick<RoomPresence, "visitorId">[];
  ownVisitorId: string | undefined;
}) {
  if (!options.isSynced || options.ownVisitorId === undefined) return undefined;
  return new Set([
    options.ownVisitorId,
    ...options.peers.map(({ visitorId }) => visitorId),
  ]).size;
}
