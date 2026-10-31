import type { RoomMember } from "./pick-room";

/** Return `true` if the watcher `userId` in `roomId` with no other player seen within `freshMs` of `now` should rejoin: another room with a free watcher slot (fewer than `maxWatchers` fresh watchers) has a fresh player, or has more fresh members than this room, or as many with a smaller room id; `false` otherwise. */
export function shouldWatcherMove(options: {
  members: RoomMember[];
  userId: string;
  roomId: string;
  now: number;
  freshMs: number;
  maxWatchers: number;
}) {
  const fresh = options.members.filter(
    (member) =>
      member.lastSeenAt > options.now - options.freshMs &&
      member.userId !== options.userId
  );
  const inRoom = (roomId: string) =>
    fresh.filter((member) => member.roomId === roomId);
  const playersIn = (roomId: string) =>
    inRoom(roomId).filter((member) => member.role === "player").length;
  const watchersIn = (roomId: string) =>
    inRoom(roomId).filter((member) => member.role === "watcher").length;
  if (playersIn(options.roomId) > 0) return false;
  const ownSize = inRoom(options.roomId).length + 1;
  return [...new Set(fresh.map((member) => member.roomId))]
    .filter(
      (roomId) =>
        roomId !== options.roomId && watchersIn(roomId) < options.maxWatchers
    )
    .some((roomId) => {
      const size = inRoom(roomId).length;
      return (
        playersIn(roomId) > 0 ||
        size > ownSize ||
        (size === ownSize && roomId < options.roomId)
      );
    });
}
