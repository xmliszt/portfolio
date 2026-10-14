"use client";

import { useContext } from "react";

import { RoomSoundsContext } from "./room-sounds-context";

/** Return which room sounds the visitor hears, and the setter that remembers the choice. */
export function useRoomSounds() {
  return useContext(RoomSoundsContext);
}
