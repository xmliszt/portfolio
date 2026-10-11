import type {
  RemoteDraft,
  RemoteEntry,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

export type RoomConnection = {
  update: (presence: RoomPresence) => void;
  sendDraft: (draft: RemoteDraft) => void;
  sendEntry: (entry: RemoteEntry) => void;
  leave: () => void;
};

export type RoomSource = {
  join: (options: {
    sessionId: string;
    onPeers: (peers: RoomPresence[]) => void;
    onDraft: (draft: RemoteDraft) => void;
    onEntry: (entry: RemoteEntry) => void;
    onConnectedChange: (isConnected: boolean) => void;
  }) => RoomConnection;
  dispose: () => void;
};
