"use client";

import { createContext } from "react";

export type SoundMuted = {
  muted: boolean;
  setMuted: (muted: boolean) => void;
};

export const SoundMutedContext = createContext<SoundMuted>({
  muted: false,
  setMuted: () => {},
});
