"use client";

import { useEffect, useRef, useState } from "react";
import { MusicNote } from "@phosphor-icons/react";
import { Howl } from "howler";

import { cn } from "@/lib/utils";

import { PianoNote } from "./piano-note.type";

import "./piano-key.css";

type PianoKeyProps = {
  note: PianoNote;
  octave: number;
};

let noteCounter = 0;
let sounds: Record<string, Howl> = {};

export function PianoKey(props: PianoKeyProps) {
  const [musicNoteIds, setMusicNoteIds] = useState<string[]>([]);
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout | undefined }>({});

  useEffect(() => {
    if (sounds[props.note]) return;

    sounds[props.note] = new Howl({
      src: [`/piano/${props.note}.mp3`],
      volume: 0.5,
      rate: 1,
    });
  }, [props.note]);

  function keyColor(note: PianoNote): "white" | "black" {
    const blackNotes: PianoNote[] = ["cs6", "ds6", "fs6", "gs6", "as6"];
    return blackNotes.includes(note) ? "black" : "white";
  }

  function isDEGABKey(note: PianoNote): boolean {
    const degabNotes: PianoNote[] = ["d6", "e6", "g6", "a6", "b6"];
    return degabNotes.includes(note);
  }

  function isFirstKey(note: PianoNote): boolean {
    return note === "c6";
  }

  function isLastKey(note: PianoNote): boolean {
    return note === "c7";
  }

  function addAnimatedMusicNote() {
    noteCounter++;
    const id = `music-note-${noteCounter}`;
    setMusicNoteIds((ids) => [...ids, id]);
    timersRef.current[id] = setTimeout(() => {
      removeAnimatedMusicNotes(id);
    }, 2500);
  }

  function removeAnimatedMusicNotes(id: string) {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setMusicNoteIds((ids) => ids.filter((musicNoteId) => musicNoteId !== id));
  }

  return (
    <button
      className={cn(
        "relative float-left m-0 list-none p-0",
        (() => {
          switch (keyColor(props.note)) {
            case "white":
              return "white text-slate-800";
            case "black":
              return "black text-slate-100";
          }
        })(),
        isDEGABKey(props.note) && "degab-key",
        isFirstKey(props.note) && "rounded-tl-lg!",
        isLastKey(props.note) && "rounded-tr-lg!"
      )}
      onPointerDown={() => {
        sounds[props.note].rate(props.octave);
        sounds[props.note].play();
        addAnimatedMusicNote();
      }}
    >
      {musicNoteIds.map((id) => (
        <span
          key={id}
          id={id}
          className={
            "animate-fade-in-float-up-wiggle absolute bottom-2 left-1/3 opacity-0"
          }
        >
          <MusicNote size={16} />
        </span>
      ))}
    </button>
  );
}
