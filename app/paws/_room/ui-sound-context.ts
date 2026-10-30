"use client";

import { createContext } from "react";

import type { UiSound } from "@/lib/paws/sound/ui-sounds";

/** Plays an interface sound in the room's sound player; does nothing outside a room. */
export const UiSoundContext = createContext<(sound: UiSound) => void>(() => {});
