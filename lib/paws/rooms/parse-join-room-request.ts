import type { JoinRoomRequest } from "./room-api-types";

/** Return the join request in `value`, reading `wantsToPlay` as `false` unless it is `true`. */
export function parseJoinRoomRequest(value: unknown): JoinRoomRequest {
  return {
    wantsToPlay:
      typeof value === "object" &&
      value !== null &&
      "wantsToPlay" in value &&
      value.wantsToPlay === true,
  };
}
