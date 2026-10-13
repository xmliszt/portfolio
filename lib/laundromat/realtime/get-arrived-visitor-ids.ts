import type { RoomPresence } from "./room-presence";

type Peer = Pick<RoomPresence, "visitorId">;

/** Return the ids of visitors other than `ownVisitorId` who are in `current` with no tab in `previous`, each once however many tabs they have open. */
export function getArrivedVisitorIds(options: {
  previous: Peer[];
  current: Peer[];
  ownVisitorId: string | undefined;
}) {
  const wereHere = new Set(options.previous.map(({ visitorId }) => visitorId));
  return [...new Set(options.current.map(({ visitorId }) => visitorId))].filter(
    (visitorId) =>
      visitorId !== options.ownVisitorId && !wereHere.has(visitorId)
  );
}
