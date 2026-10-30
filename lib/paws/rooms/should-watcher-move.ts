import type { RoomMember } from "./pick-room";

/** Return `true` if the watcher `userId` sits in `roomId` with no other player seen within `freshMs` of `now` while another room has a fresh player and fewer than `maxWatchers` fresh watchers; `false` otherwise. */
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
  const playersIn = (roomId: string) =>
    fresh.filter(
      (member) => member.roomId === roomId && member.role === "player"
    ).length;
  const watchersIn = (roomId: string) =>
    fresh.filter(
      (member) => member.roomId === roomId && member.role === "watcher"
    ).length;
  if (playersIn(options.roomId) > 0) return false;
  return [...new Set(fresh.map((member) => member.roomId))].some(
    (roomId) =>
      roomId !== options.roomId &&
      playersIn(roomId) > 0 &&
      watchersIn(roomId) < options.maxWatchers
  );
}
