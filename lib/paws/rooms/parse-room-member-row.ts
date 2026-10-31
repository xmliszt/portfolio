import type { RoomMember } from "./pick-room";

/** Return the `paws.room_members` row in `value` as a room member, or `undefined` when a column is missing or malformed. */
export function parseRoomMemberRow(value: unknown): RoomMember | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("room_id" in value && typeof value.room_id === "string") ||
    !("user_id" in value && typeof value.user_id === "string") ||
    !(
      "role" in value &&
      (value.role === "player" || value.role === "watcher")
    ) ||
    !("last_seen_at" in value && typeof value.last_seen_at === "string")
  ) {
    return undefined;
  }
  const lastSeenAt = Date.parse(value.last_seen_at);
  if (Number.isNaN(lastSeenAt)) return undefined;
  return {
    roomId: value.room_id,
    userId: value.user_id,
    role: value.role,
    lastSeenAt,
  };
}
