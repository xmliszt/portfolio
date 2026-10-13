import type {
  RemoteClock,
  RemoteDraft,
  RemoteEntry,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

export type RoomConnection = {
  update: (presence: RoomPresence) => void;
  sendDraft: (draft: RemoteDraft) => void;
  sendEntry: (entry: RemoteEntry) => void;
  sendClock: (clock: RemoteClock) => void;
  leave: () => void;
};

export type RoomSource = {
  join: (options: {
    sessionId: string;
    onPeers: (peers: RoomPresence[]) => void;
    onDraft: (draft: RemoteDraft) => void;
    onEntry: (entry: RemoteEntry) => void;
    onClock: (options: { clock: RemoteClock; receivedAt: number }) => void;
    onConnectedChange: (isConnected: boolean) => void;
    onUrgentReadyChange: (isReady: boolean) => void;
  }) => RoomConnection;
  dispose: () => void;
};
