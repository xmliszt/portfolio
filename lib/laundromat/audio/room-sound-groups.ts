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
