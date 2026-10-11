import type {
  RemoteDraft,
  RoomPresence,
} from "@/lib/laundromat/realtime/room-presence";

export type RoomConnection = {
  update: (presence: RoomPresence) => void;
  sendDraft: (draft: RemoteDraft) => void;
  leave: () => void;
};

export type RoomSource = {
  join: (options: {
    sessionId: string;
    onPeers: (peers: RoomPresence[]) => void;
    onDraft: (draft: RemoteDraft) => void;
    onConnectedChange: (isConnected: boolean) => void;
  }) => RoomConnection;
  dispose: () => void;
};
