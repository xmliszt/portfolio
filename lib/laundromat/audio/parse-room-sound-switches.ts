import type { RoomSoundSwitches } from "./room-sound-groups";

function readOffGroups(stored: string | null): unknown[] {
  if (stored === null) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Return which room sounds are on, given `stored` as a JSON list of the groups turned off; every group is on when `stored` is missing or unreadable. */
export function parseRoomSoundSwitches(
  stored: string | null
): RoomSoundSwitches {
  const off = readOffGroups(stored);
  return {
    machines: !off.includes("machines"),
    "shop-bell": !off.includes("shop-bell"),
    unloading: !off.includes("unloading"),
    coffee: !off.includes("coffee"),
    tv: !off.includes("tv"),
    lamp: !off.includes("lamp"),
    weather: !off.includes("weather"),
  };
}
