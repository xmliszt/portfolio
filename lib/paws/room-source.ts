import type {
  CatsMessage,
  FingerMessage,
  PlayerPresence,
  RoomEvent,
} from "./wire-types";

export type RoomRole = "player" | "watcher";

export type RoomConnection = {
  sendFinger: (finger: FingerMessage) => void;
  sendCats: (cats: CatsMessage) => void;
  sendEvent: (event: RoomEvent) => void;
  leave: () => void;
};

/** A room on a Realtime channel; watchers receive everything but their sends are refused by the server. */
export type RoomSource = {
  join: (options: {
    roomId: string;
    role: RoomRole;
    self: PlayerPresence | undefined;
    onPlayers: (players: PlayerPresence[]) => void;
    onFinger: (finger: FingerMessage) => void;
    onCats: (cats: CatsMessage) => void;
    onEvent: (event: RoomEvent) => void;
  }) => RoomConnection;
  dispose: () => void;
};
