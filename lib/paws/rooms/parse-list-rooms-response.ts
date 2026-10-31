import type { RoomSummary } from "./room-api-types";

const ROOM_ID_PATTERN = /^[a-z0-9-]{1,64}$/;

function parseCount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}

/** Return the rooms in the list route's answer, dropping malformed ones, or `undefined` when the answer is not a list. */
export function parseListRoomsResponse(
  value: unknown
): RoomSummary[] | undefined {
  if (
    typeof value !== "object" ||
    value === null ||
    !("kind" in value) ||
    value.kind !== "rooms" ||
    !("rooms" in value) ||
    !Array.isArray(value.rooms)
  )
    return undefined;
  return value.rooms.flatMap((room: unknown): RoomSummary[] => {
    if (typeof room !== "object" || room === null) return [];
    const roomId =
      "roomId" in room &&
      typeof room.roomId === "string" &&
      ROOM_ID_PATTERN.test(room.roomId)
        ? room.roomId
        : undefined;
    const players = "players" in room ? parseCount(room.players) : undefined;
    const watchers = "watchers" in room ? parseCount(room.watchers) : undefined;
    return roomId === undefined ||
      players === undefined ||
      watchers === undefined
      ? []
      : [{ roomId, players, watchers }];
  });
}
