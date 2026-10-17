"use client";

import { useEffect, useState } from "react";

import { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";
import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import { parseRoomSoundVolumes } from "@/lib/laundromat/audio/parse-room-sound-volumes";
import type {
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";
import { ROOM_SOUND_GROUPS } from "@/lib/laundromat/audio/room-sound-groups";

import { RoomSoundsContext } from "./room-sounds-context";
import type { SoundBoard } from "./sound-board-context";
import { SoundBoardContext } from "./sound-board-context";
import { SoundMutedContext } from "./sound-muted-context";

const SOUND_STORAGE_KEY = "laundromat:sound";
const ROOM_SOUNDS_STORAGE_KEY = "laundromat:room-sounds";
const ROOM_SOUND_VOLUMES_STORAGE_KEY = "laundromat:room-sound-volumes";
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

function readRoomSoundVolumes() {
  try {
    return parseRoomSoundVolumes(
      window.localStorage.getItem(ROOM_SOUND_VOLUMES_STORAGE_KEY)
    );
  } catch {
    return parseRoomSoundVolumes(null);
  }
}

/** Provide one sound board, the visitor's sound on/off choice, and which room sounds they hear and how loud, to the laundromat, silencing each group they turned off on the board, unlocking audio on the first press, tap or key and closing it on unmount. */
export function SoundBoardProvider(props: SoundBoardProviderProps) {
  const [board, setBoard] = useState<SoundBoard>();
  const [muted, setMutedState] = useState(false);
  const [roomSounds, setRoomSoundsState] = useState(() =>
    parseRoomSoundSwitches(null)
  );
  const [volumes, setVolumesState] = useState(() =>
    parseRoomSoundVolumes(null)
  );

  useEffect(() => {
    setMutedState(readIsMuted());
    setRoomSoundsState(readRoomSoundSwitches());
    setVolumesState(readRoomSoundVolumes());
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

  useEffect(() => {
    ROOM_SOUND_GROUPS.forEach((group) =>
      board?.setGroupVolume(group, roomSounds[group] ? volumes[group] : 0)
    );
  }, [board, roomSounds, volumes]);

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

  function setVolumes(next: RoomSoundVolumes) {
    setVolumesState(next);
    try {
      window.localStorage.setItem(
        ROOM_SOUND_VOLUMES_STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {
      return;
    }
  }

  return (
    <SoundBoardContext.Provider value={board}>
      <SoundMutedContext.Provider value={{ muted, setMuted }}>
        <RoomSoundsContext.Provider
          value={{
            switches: roomSounds,
            setSwitches: setRoomSounds,
            volumes,
            setVolumes,
          }}
        >
          {props.children}
        </RoomSoundsContext.Provider>
      </SoundMutedContext.Provider>
    </SoundBoardContext.Provider>
  );
}
