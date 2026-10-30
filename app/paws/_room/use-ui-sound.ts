"use client";

import { useContext } from "react";

import { UiSoundContext } from "./ui-sound-context";

/** Return the function that plays an interface sound in the room. */
export function useUiSound() {
  return useContext(UiSoundContext);
}
