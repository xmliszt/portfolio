import type { RoomRequest } from "./room-api-types";

const ROOM_ID_PATTERN = /^[a-z0-9-]{1,64}$/;

/** Return the heartbeat or leave request in `value`, or `undefined` when `roomId` is missing or not a room id. */
export function parseRoomRequest(value: unknown): RoomRequest | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !(
      "roomId" in value &&
      typeof value.roomId === "string" &&
      ROOM_ID_PATTERN.test(value.roomId)
    )
  ) {
    return undefined;
  }
  return { roomId: value.roomId };
}
