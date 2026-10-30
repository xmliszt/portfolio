import type { JoinRoomResponse } from "@/lib/paws/rooms/room-api-types";

/** Return the join route's answer in `value`, or `undefined` when it is not one. */
export function parseJoinRoomResponse(
  value: unknown
): JoinRoomResponse | undefined {
  if (typeof value !== "object" || value === null || !("kind" in value))
    return undefined;
  switch (value.kind) {
    case "joined":
      if (
        !("roomId" in value && typeof value.roomId === "string") ||
        !("topic" in value && typeof value.topic === "string") ||
        !(
          "role" in value &&
          (value.role === "player" || value.role === "watcher")
        )
      ) {
        return undefined;
      }
      return {
        kind: "joined",
        roomId: value.roomId,
        topic: value.topic,
        role: value.role,
      };
    case "full":
    case "tooManyJoins":
    case "forbidden":
    case "failed":
      return { kind: value.kind };
    default:
      return undefined;
  }
}
