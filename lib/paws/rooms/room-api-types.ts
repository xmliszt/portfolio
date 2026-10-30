import type { RoomRole } from "@/lib/paws/room-source";

export type JoinRoomRequest = { wantsToPlay: boolean };

export type JoinRoomResponse =
  | { kind: "joined"; roomId: string; topic: string; role: RoomRole }
  | { kind: "full" }
  | { kind: "tooManyJoins" }
  | { kind: "forbidden" }
  | { kind: "failed" };

/** Body of the heartbeat and leave requests. */
export type RoomRequest = { roomId: string };

export type HeartbeatResponse =
  | { kind: "seen" }
  | { kind: "gone" }
  | { kind: "move" }
  | { kind: "forbidden" }
  | { kind: "failed" };

export type LeaveRoomResponse =
  | { kind: "left" }
  | { kind: "forbidden" }
  | { kind: "failed" };
