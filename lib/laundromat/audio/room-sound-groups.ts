export const ROOM_SOUND_GROUPS = [
  "machines",
  "shop-bell",
  "unloading",
  "coffee",
  "tv",
  "lamp",
] as const;

export type RoomSoundGroup = (typeof ROOM_SOUND_GROUPS)[number];

export type RoomSoundSwitches = { [group in RoomSoundGroup]: boolean };
