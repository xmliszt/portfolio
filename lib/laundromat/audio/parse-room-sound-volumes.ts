import { clampRoomSoundVolume } from "./clamp-room-sound-volume";
import type { RoomSoundGroup, RoomSoundVolumes } from "./room-sound-groups";
import { ROOM_SOUND_VOLUME } from "./room-sound-groups";

function readStoredObject(stored: string | null): { [key: string]: unknown } {
  if (stored === null) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? { ...parsed }
      : {};
  } catch {
    return {};
  }
}

/** Return each room sound's volume, given `stored` as a JSON object of volumes by group; a group that is missing or unreadable gets `ROOM_SOUND_VOLUME.usual`, and the rest are clamped into range. */
export function parseRoomSoundVolumes(stored: string | null): RoomSoundVolumes {
  const volumes = readStoredObject(stored);
  function read(group: RoomSoundGroup) {
    return clampRoomSoundVolume(volumes[group]) ?? ROOM_SOUND_VOLUME.usual;
  }
  return {
    machines: read("machines"),
    "shop-bell": read("shop-bell"),
    unloading: read("unloading"),
    coffee: read("coffee"),
    tv: read("tv"),
    lamp: read("lamp"),
    weather: read("weather"),
  };
}
