"use client";

import { useContext } from "react";

import { SoundBoardContext } from "./sound-board-context";

/** Return the laundromat's sound board, or `undefined` outside a `SoundBoardProvider`. */
export function useSoundBoard() {
  return useContext(SoundBoardContext);
}
