import type {
  RemoteDraft,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

import type { RoomSource } from "./room-source";

type Listener = {
  onPeers: (peers: RoomPresence[]) => void;
  onDraft: (draft: RemoteDraft) => void;
};

/** Return a room source whose other visitors and drafts are set by hand with `setPeers` and `setDraft`, for tuning the scene without a second browser. */
export function createFakeRoomSource() {
  const state: {
    peers: RoomPresence[];
    draft?: RemoteDraft;
    listeners: Listener[];
  } = { peers: [], listeners: [] };
  const source: RoomSource = {
    join({ onPeers, onDraft, onConnectedChange }) {
      const listener = { onPeers, onDraft };
      state.listeners = [...state.listeners, listener];
      onConnectedChange(true);
      onPeers(state.peers);
      if (state.draft !== undefined) onDraft(state.draft);
      return {
        update: () => {},
        sendDraft: () => {},
        sendEntry: () => {},
        leave() {
          state.listeners = state.listeners.filter(
            (candidate) => candidate !== listener
          );
        },
      };
    },
    dispose: () => {},
  };
  return {
    source,
    setPeers(peers: RoomPresence[]) {
      state.peers = peers;
      state.listeners.forEach((listener) => listener.onPeers(peers));
    },
    setDraft(draft: RemoteDraft) {
      state.draft = draft;
      state.listeners.forEach((listener) => listener.onDraft(draft));
    },
  };
}
