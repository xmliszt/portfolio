import type { JoinRoomRequest } from "./room-api-types";

const ROOM_ID_PATTERN = /^[a-z0-9-]{1,64}$/;

/** Return the join request in `value`, reading `wantsToPlay` as `false` unless it is `true`, and keeping `roomId` only when it is a room id. */
export function parseJoinRoomRequest(value: unknown): JoinRoomRequest {
  const isObject = typeof value === "object" && value !== null;
  const roomId =
    isObject &&
    "roomId" in value &&
    typeof value.roomId === "string" &&
    ROOM_ID_PATTERN.test(value.roomId)
      ? value.roomId
      : undefined;
  return {
    wantsToPlay:
      isObject && "wantsToPlay" in value && value.wantsToPlay === true,
    ...(roomId === undefined ? {} : { roomId }),
  };
}
