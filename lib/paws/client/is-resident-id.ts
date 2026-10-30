import { ROOM_LIMITS } from "@/lib/paws/room-limits";

const RESIDENT_ID_PATTERN = /^resident-([1-9][0-9]*)$/;

/** `true` if `userId` names one of the room's `ROOM_LIMITS.residentCats` resident cats; `false` when it names anyone else. */
export function isResidentId(userId: string) {
  const number = Number(RESIDENT_ID_PATTERN.exec(userId)?.[1]);
  return number >= 1 && number <= ROOM_LIMITS.residentCats;
}
