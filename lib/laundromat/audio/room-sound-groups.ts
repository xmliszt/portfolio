export const ROOM_SOUND_GROUPS = [
  "machines",
  "shop-bell",
  "unloading",
  "coffee",
  "tv",
  "lamp",
  "weather",
] as const;

export type RoomSoundGroup = (typeof ROOM_SOUND_GROUPS)[number];

export type RoomSoundSwitches = { [group in RoomSoundGroup]: boolean };

export type RoomSoundVolumes = { [group in RoomSoundGroup]: number };

export const ROOM_SOUND_VOLUME = { min: 0, max: 1.5, usual: 1 };
