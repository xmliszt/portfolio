"use client";

import { createContext } from "react";

import type { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";

export type SoundBoard = ReturnType<typeof createSoundBoard>;

export const SoundBoardContext = createContext<SoundBoard | undefined>(
  undefined
);
