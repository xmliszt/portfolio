"use client";

import { createContext } from "react";

import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import type { RoomSoundSwitches } from "@/lib/laundromat/audio/room-sound-groups";

export type RoomSounds = {
  switches: RoomSoundSwitches;
  setSwitches: (switches: RoomSoundSwitches) => void;
};

export const RoomSoundsContext = createContext<RoomSounds>({
  switches: parseRoomSoundSwitches(null),
  setSwitches: () => {},
});
