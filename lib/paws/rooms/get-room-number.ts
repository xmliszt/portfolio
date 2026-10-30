import { hashUserId } from "@/lib/paws/sound/hash-user-id";

/** Return the three-digit number a room is shown as, the same for `roomId` on every screen. */
export function getRoomNumber(roomId: string) {
  return 100 + Math.floor(hashUserId(roomId) * 900);
}
