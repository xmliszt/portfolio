import type { RoomMember } from "./pick-room";
import type { RoomSummary } from "./room-api-types";

const MAX_ROOMS = 20;

/** Return each room with a member seen within `freshMs` of `now`, with its fresh player and watcher counts, busiest first and at most `MAX_ROOMS`. */
export function summarizeRooms(options: {
  members: RoomMember[];
  now: number;
  freshMs: number;
}): RoomSummary[] {
  const fresh = options.members.filter(
    (member) => member.lastSeenAt > options.now - options.freshMs
  );
  return [...new Set(fresh.map((member) => member.roomId))]
    .map((roomId) => {
      const inRoom = fresh.filter((member) => member.roomId === roomId);
      return {
        roomId,
        players: inRoom.filter((member) => member.role === "player").length,
        watchers: inRoom.filter((member) => member.role === "watcher").length,
      };
    })
    .toSorted(
      (a, b) =>
        b.players - a.players ||
        b.watchers - a.watchers ||
        a.roomId.localeCompare(b.roomId)
    )
    .slice(0, MAX_ROOMS);
}
