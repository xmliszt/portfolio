"use client";

import { useEffect, useState } from "react";

import { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";
import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import type { RoomSoundSwitches } from "@/lib/laundromat/audio/room-sound-groups";
import { ROOM_SOUND_GROUPS } from "@/lib/laundromat/audio/room-sound-groups";

import { RoomSoundsContext } from "./room-sounds-context";
import type { SoundBoard } from "./sound-board-context";
import { SoundBoardContext } from "./sound-board-context";
import { SoundMutedContext } from "./sound-muted-context";

const SOUND_STORAGE_KEY = "laundromat:sound";
const ROOM_SOUNDS_STORAGE_KEY = "laundromat:room-sounds";
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

function readRoomSoundSwitches() {
  try {
    return parseRoomSoundSwitches(
      window.localStorage.getItem(ROOM_SOUNDS_STORAGE_KEY)
    );
  } catch {
    return parseRoomSoundSwitches(null);
  }
}

/** Provide one sound board, the visitor's sound on/off choice and which room sounds they hear to the laundromat, unlocking audio on the first press, tap or key and closing it on unmount. */
export function SoundBoardProvider(props: SoundBoardProviderProps) {
  const [board, setBoard] = useState<SoundBoard>();
  const [muted, setMutedState] = useState(false);
  const [roomSounds, setRoomSoundsState] = useState(() =>
    parseRoomSoundSwitches(null)
  );

  useEffect(() => {
    setMutedState(readIsMuted());
    setRoomSoundsState(readRoomSoundSwitches());
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

  function setRoomSounds(next: RoomSoundSwitches) {
    setRoomSoundsState(next);
    try {
      window.localStorage.setItem(
        ROOM_SOUNDS_STORAGE_KEY,
        JSON.stringify(ROOM_SOUND_GROUPS.filter((group) => !next[group]))
      );
    } catch {
      return;
    }
  }

  return (
    <SoundBoardContext.Provider value={board}>
      <SoundMutedContext.Provider value={{ muted, setMuted }}>
        <RoomSoundsContext.Provider
          value={{ switches: roomSounds, setSwitches: setRoomSounds }}
        >
          {props.children}
        </RoomSoundsContext.Provider>
      </SoundMutedContext.Provider>
    </SoundBoardContext.Provider>
  );
}
