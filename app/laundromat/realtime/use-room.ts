"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { omit } from "lodash";

import type {
  RemoteDraft,
  RemoteEntry,
  RemoteLoad,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

import type { RoomConnection } from "./room-source";
import { RoomSourceContext } from "./room-source-context";

const DRAFT_SEND_INTERVAL_MS = 150;

type OwnPresence = Omit<RoomPresence, "sessionId">;

/** Join the laundromat room as this tab while `presence` is set, keeping it tracked, and return this tab's `sessionId`, whether the room is connected, whether presence has synced since it connected, the other tabs last seen here, the latest draft of each, the last entry another tab saved, `sendDraft`, throttled and sent again whenever someone new arrives, and `sendEntry`. */
export function useRoom(presence: OwnPresence | undefined) {
  const source = useContext(RoomSourceContext);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [peers, setPeers] = useState<RoomPresence[]>([]);
  const peersRef = useRef(peers);
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [drafts, setDrafts] = useState<{ [sessionId: string]: RemoteDraft }>(
    {}
  );
  const [lastEntry, setLastEntry] = useState<RemoteEntry>();
  const connectionRef = useRef<RoomConnection>(undefined);
  const latestDraftRef = useRef<RemoteDraft>(undefined);
  const draftTimerRef = useRef<number>(undefined);
  const visitorId = presence?.visitorId;

  useEffect(() => {
    if (source === undefined || visitorId === undefined) return;
    const connection = source.join({
      sessionId,
      onPeers: (next) => {
        peersRef.current = next;
        setPeers(next);
        setIsSynced(true);
      },
      onConnectedChange: (connected) => {
        setIsConnected(connected);
        if (!connected) setIsSynced(false);
      },
      onDraft: (draft) => {
        const isTrackedPeer = peersRef.current.some(
          (peer) => peer.sessionId === draft.sessionId
        );
        if (!isTrackedPeer) return;
        setDrafts((current) => ({ ...current, [draft.sessionId]: draft }));
      },
      onEntry: (entry) => {
        const isTrackedPeer = peersRef.current.some(
          (peer) => peer.sessionId === entry.sessionId
        );
        if (!isTrackedPeer) return;
        setDrafts((current) => omit(current, entry.sessionId));
        setLastEntry(entry);
      },
    });
    connectionRef.current = connection;
    return () => {
      window.clearTimeout(draftTimerRef.current);
      draftTimerRef.current = undefined;
      connectionRef.current = undefined;
      connection.leave();
      peersRef.current = [];
      setPeers([]);
      setDrafts({});
      setLastEntry(undefined);
      setIsConnected(false);
      setIsSynced(false);
    };
  }, [source, sessionId, visitorId]);

  const loadPhase = presence?.load?.phase;
  const loadKind = presence?.load?.kind;
  const loadMachineId = presence?.load?.machineId;
  const loadStartedAt =
    presence?.load?.phase === "running" ? presence.load.startedAt : undefined;
  const loadDurationMs =
    presence?.load?.phase === "running" ? presence.load.durationMs : undefined;
  const writingSince = presence?.writingSince;
  const regionLatDeg = presence?.region?.latDeg;
  const regionLonDeg = presence?.region?.lonDeg;
  useEffect(() => {
    if (visitorId === undefined) return;
    const load = ((): RemoteLoad | undefined => {
      if (loadKind === undefined) return undefined;
      const machine =
        loadMachineId === undefined ? {} : { machineId: loadMachineId };
      if (loadPhase === "loaded" || loadPhase === "done") {
        return { phase: loadPhase, kind: loadKind, ...machine };
      }
      if (loadStartedAt === undefined || loadDurationMs === undefined) {
        return undefined;
      }
      return {
        phase: "running",
        kind: loadKind,
        ...machine,
        startedAt: loadStartedAt,
        durationMs: loadDurationMs,
      };
    })();
    const region =
      regionLatDeg === undefined || regionLonDeg === undefined
        ? undefined
        : { latDeg: regionLatDeg, lonDeg: regionLonDeg };
    connectionRef.current?.update({
      sessionId,
      visitorId,
      ...(region === undefined ? {} : { region }),
      ...(load === undefined ? {} : { load }),
      ...(writingSince === undefined ? {} : { writingSince }),
    });
  }, [
    source,
    sessionId,
    visitorId,
    loadPhase,
    loadKind,
    loadMachineId,
    loadStartedAt,
    loadDurationMs,
    regionLatDeg,
    regionLonDeg,
    writingSince,
  ]);

  const peerIds = peers.map((peer) => peer.sessionId).join(",");
  useEffect(() => {
    const present = peerIds.split(",");
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id]) => present.includes(id))
      )
    );
    const latest = latestDraftRef.current;
    if (latest !== undefined && latest.text !== "") {
      connectionRef.current?.sendDraft(latest);
    }
  }, [peerIds]);

  function sendDraft(draft: Omit<RemoteDraft, "sessionId">) {
    latestDraftRef.current = { sessionId, ...draft };
    if (draftTimerRef.current !== undefined) return;
    draftTimerRef.current = window.setTimeout(() => {
      draftTimerRef.current = undefined;
      const latest = latestDraftRef.current;
      if (latest !== undefined) connectionRef.current?.sendDraft(latest);
    }, DRAFT_SEND_INTERVAL_MS);
  }

  function sendEntry(entry: Omit<RemoteEntry, "sessionId">) {
    connectionRef.current?.sendEntry({ sessionId, ...entry });
  }

  return {
    sessionId,
    isConnected,
    isSynced,
    peers,
    drafts,
    lastEntry,
    sendDraft,
    sendEntry,
  };
}
