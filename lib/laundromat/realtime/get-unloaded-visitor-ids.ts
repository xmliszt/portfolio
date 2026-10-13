import type { RoomPresence } from "./room-presence";

type Peer = Pick<RoomPresence, "visitorId" | "load">;

function getFinishingMachineKeys(options: {
  peers: Peer[];
  visitorId: string;
}) {
  return options.peers.flatMap(({ visitorId, load }) =>
    visitorId === options.visitorId &&
    (load?.phase === "running" || load?.phase === "done")
      ? [load.machineId ?? load.kind]
      : []
  );
}

/** Return the ids of visitors other than `ownVisitorId` who are in `current` and had a `running` or `done` load in `previous` on a machine where none of their tabs has one in `current`, each once however many tabs they have open. */
export function getUnloadedVisitorIds(options: {
  previous: Peer[];
  current: Peer[];
  ownVisitorId: string | undefined;
}) {
  const { previous, current } = options;
  return [...new Set(current.map(({ visitorId }) => visitorId))].filter(
    (visitorId) => {
      if (visitorId === options.ownVisitorId) return false;
      const stillFinishing = getFinishingMachineKeys({
        peers: current,
        visitorId,
      });
      return getFinishingMachineKeys({ peers: previous, visitorId }).some(
        (key) => !stillFinishing.includes(key)
      );
    }
  );
}
