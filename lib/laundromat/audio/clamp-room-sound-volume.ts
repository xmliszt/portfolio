import { ROOM_SOUND_VOLUME } from "./room-sound-groups";

/** Return `volume` rounded to a whole percent and kept within `ROOM_SOUND_VOLUME.min` to `ROOM_SOUND_VOLUME.max`, or `undefined` when it is not a finite number. */
export function clampRoomSoundVolume(volume: unknown) {
  if (typeof volume !== "number" || !Number.isFinite(volume)) return undefined;
  const rounded = Math.round(volume * 100) / 100;
  return Math.min(
    ROOM_SOUND_VOLUME.max,
    Math.max(ROOM_SOUND_VOLUME.min, rounded)
  );
}
