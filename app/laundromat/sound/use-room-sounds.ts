"use client";

import { useContext } from "react";

import { RoomSoundsContext } from "./room-sounds-context";

/** Return which room sounds the visitor hears and how loud each one is, with the setters that remember those choices. */
export function useRoomSounds() {
  return useContext(RoomSoundsContext);
}
