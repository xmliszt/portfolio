"use client";

import { createContext } from "react";

import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import { parseRoomSoundVolumes } from "@/lib/laundromat/audio/parse-room-sound-volumes";
import type {
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";

export type RoomSounds = {
  switches: RoomSoundSwitches;
  setSwitches: (switches: RoomSoundSwitches) => void;
  volumes: RoomSoundVolumes;
  setVolumes: (volumes: RoomSoundVolumes) => void;
};

export const RoomSoundsContext = createContext<RoomSounds>({
  switches: parseRoomSoundSwitches(null),
  setSwitches: () => {},
  volumes: parseRoomSoundVolumes(null),
  setVolumes: () => {},
});
