"use client";

import { useContext, useEffect, useRef, useState } from "react";

import type {
  RemoteDraft,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

import type { RoomConnection } from "./room-source";
import { RoomSourceContext } from "./room-source-context";

const DRAFT_SEND_INTERVAL_MS = 150;

type OwnPresence = Omit<RoomPresence, "sessionId">;

/** Join the laundromat room as this tab while `presence` is set, keeping it tracked, and return this tab's `sessionId`, whether the room is connected, the other tabs last seen here, the latest draft of each, and `sendDraft`, throttled and sent again whenever someone new arrives. */
export function useRoom(presence: OwnPresence | undefined) {
  const source = useContext(RoomSourceContext);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [peers, setPeers] = useState<RoomPresence[]>([]);
  const peersRef = useRef(peers);
  const [isConnected, setIsConnected] = useState(false);
  const [drafts, setDrafts] = useState<{ [sessionId: string]: RemoteDraft }>(
    {}
  );
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
      },
      onConnectedChange: setIsConnected,
      onDraft: (draft) => {
        const isTrackedPeer = peersRef.current.some(
          (peer) => peer.sessionId === draft.sessionId
        );
        if (!isTrackedPeer) return;
        setDrafts((current) => ({ ...current, [draft.sessionId]: draft }));
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
      setIsConnected(false);
    };
  }, [source, sessionId, visitorId]);

  const loadKind = presence?.load?.kind;
  const loadStartedAt = presence?.load?.startedAt;
  const loadDurationMs = presence?.load?.durationMs;
  const writingSince = presence?.writingSince;
  const regionLatDeg = presence?.region?.latDeg;
  const regionLonDeg = presence?.region?.lonDeg;
  useEffect(() => {
    if (visitorId === undefined) return;
    const load =
      loadKind === undefined ||
      loadStartedAt === undefined ||
      loadDurationMs === undefined
        ? undefined
        : {
            kind: loadKind,
            startedAt: loadStartedAt,
            durationMs: loadDurationMs,
          };
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
    loadKind,
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

  return { sessionId, isConnected, peers, drafts, sendDraft };
}
