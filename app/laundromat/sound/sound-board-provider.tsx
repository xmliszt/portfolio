"use client";

import { useEffect, useState } from "react";

import { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";

import type { SoundBoard } from "./sound-board-context";
import { SoundBoardContext } from "./sound-board-context";
import { SoundMutedContext } from "./sound-muted-context";

const SOUND_STORAGE_KEY = "laundromat:sound";
const UNLOCK_EVENTS = ["pointerdown", "pointerup", "click", "keydown"];

type SoundBoardProviderProps = {
  children: React.ReactNode;
};

function readIsMuted() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === "off";
  } catch {
    return false;
  }
}

/** Provide one sound board and the visitor's sound on/off choice to the laundromat, unlocking audio on the first press, tap or key and closing it on unmount. */
export function SoundBoardProvider(props: SoundBoardProviderProps) {
  const [board, setBoard] = useState<SoundBoard>();
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(readIsMuted());
    const created = createSoundBoard();
    setBoard(created);
    function unlock() {
      void created.resume();
    }
    UNLOCK_EVENTS.forEach((type) =>
      window.addEventListener(type, unlock, { capture: true })
    );
    return () => {
      UNLOCK_EVENTS.forEach((type) =>
        window.removeEventListener(type, unlock, { capture: true })
      );
      created.dispose();
    };
  }, []);

  useEffect(() => {
    board?.setMuted(muted);
  }, [board, muted]);

  function setMuted(next: boolean) {
    setMutedState(next);
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "off" : "on");
    } catch {
      return;
    }
  }

  return (
    <SoundBoardContext.Provider value={board}>
      <SoundMutedContext.Provider value={{ muted, setMuted }}>
        {props.children}
      </SoundMutedContext.Provider>
    </SoundBoardContext.Provider>
  );
}
