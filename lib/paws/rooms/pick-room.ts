import type { RoomRole } from "@/lib/paws/room-source";

export type RoomMember = {
  roomId: string;
  userId: string;
  role: RoomRole;
  lastSeenAt: number;
};

export type PickedRoom =
  | { kind: "existing"; roomId: string }
  | { kind: "new"; roomId: string }
  | { kind: "full" };

/** Return the room `userId` should join as `role`: the room with the most other players that still has a slot for that role, preferring the room they are already in on a tie, else a new room from `createRoomId` for a player or when there are no rooms, and `full` for a watcher otherwise; members not seen within `freshMs` of `now` do not count. */
export function pickRoom(options: {
  members: RoomMember[];
  userId: string;
  role: RoomRole;
  now: number;
  freshMs: number;
  limits: { maxPlayers: number; maxWatchers: number };
  createRoomId: () => string;
}): PickedRoom {
  const fresh = options.members.filter(
    (member) => member.lastSeenAt > options.now - options.freshMs
  );
  const others = fresh.filter((member) => member.userId !== options.userId);
  const ownRoomId = fresh.find(
    (member) => member.userId === options.userId
  )?.roomId;
  const limit =
    options.role === "player"
      ? options.limits.maxPlayers
      : options.limits.maxWatchers;
  const rooms = [...new Set(fresh.map((member) => member.roomId))].map(
    (roomId) => {
      const inRoom = others.filter((member) => member.roomId === roomId);
      return {
        roomId,
        isOwn: roomId === ownRoomId,
        players: inRoom.filter((member) => member.role === "player").length,
        sameRole: inRoom.filter((member) => member.role === options.role)
          .length,
      };
    }
  );
  const best = rooms
    .filter((room) => room.sameRole < limit)
    .toSorted(
      (a, b) =>
        b.players - a.players ||
        Number(b.isOwn) - Number(a.isOwn) ||
        a.roomId.localeCompare(b.roomId)
    )
    .at(0);
  if (best !== undefined) return { kind: "existing", roomId: best.roomId };
  if (options.role === "player" || rooms.length === 0)
    return { kind: "new", roomId: options.createRoomId() };
  return { kind: "full" };
}
