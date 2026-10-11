"use client";

import { useContext } from "react";

import { SoundMutedContext } from "./sound-muted-context";

/** Return whether the visitor turned the laundromat's sound off, and the setter that remembers the choice. */
export function useSoundMuted() {
  return useContext(SoundMutedContext);
}
