"use client";

import { useEffect, useRef, useState } from "react";

import { createSoundBoard } from "@/lib/laundromat/audio/create-sound-board";
import type { LoopName, SoundName } from "@/lib/laundromat/audio/sound-names";
import { LOOP_NAMES, SOUND_NAMES } from "@/lib/laundromat/audio/sound-names";
import { cn } from "@/lib/utils";

type SoundBoard = ReturnType<typeof createSoundBoard>;

const KNOB_BURST_COUNT = 6;
const KNOB_BURST_SPACING_MS = 70;
const BUTTON_CLASS =
  "rounded-md border border-[var(--lm-edge)] px-3 py-1.5 text-left text-[11px] lowercase hover:border-[var(--lm-line)] hover:text-[var(--lm-ink-hi)]";

type SourceTagProps = { sample: boolean };

function SourceTag(props: SourceTagProps) {
  return (
    <span className="ml-1.5 text-[var(--lm-line)]">
      {props.sample ? "· sample" : "· synth"}
    </span>
  );
}

export function SoundAudition() {
  const boardRef = useRef<SoundBoard | undefined>(undefined);
  const [runningLoops, setRunningLoops] = useState<{
    [name in LoopName]?: boolean;
  }>({});
  const [muted, setMuted] = useState(false);
  const [sampleNames, setSampleNames] = useState<string[]>([]);

  useEffect(() => {
    const board = createSoundBoard();
    boardRef.current = board;
    return () => {
      board.dispose();
      boardRef.current = undefined;
    };
  }, []);

  function readSampleNames() {
    const board = boardRef.current;
    setSampleNames(
      [...SOUND_NAMES, ...LOOP_NAMES].filter((name) => board?.hasSample(name))
    );
  }

  async function handlePlay(name: SoundName) {
    await boardRef.current?.resume();
    boardRef.current?.play(name);
    readSampleNames();
  }

  async function handleKnobBurst() {
    await boardRef.current?.resume();
    Array.from({ length: KNOB_BURST_COUNT }).forEach((_, index) =>
      setTimeout(
        () => boardRef.current?.play("knob-click"),
        index * KNOB_BURST_SPACING_MS
      )
    );
  }

  async function handleToggleLoop(name: LoopName) {
    const isRunning = !runningLoops[name];
    setRunningLoops((current) => ({ ...current, [name]: isRunning }));
    await boardRef.current?.resume();
    if (isRunning) boardRef.current?.startLoop(name);
    else boardRef.current?.stopLoop(name);
    readSampleNames();
  }

  function handleToggleMute() {
    boardRef.current?.setMuted(!muted);
    setMuted(!muted);
  }

  return (
    <div className="flex max-w-md flex-col gap-y-6 p-6">
      <section className="flex flex-col gap-y-2">
        <h2 className="text-[11px] lowercase">one-shots</h2>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {SOUND_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              className={BUTTON_CLASS}
              onClick={() => handlePlay(name)}
            >
              {name}
              <SourceTag sample={sampleNames.includes(name)} />
            </button>
          ))}
          <button
            type="button"
            className={BUTTON_CLASS}
            onClick={handleKnobBurst}
          >
            knob-click ×{KNOB_BURST_COUNT}
          </button>
        </div>
      </section>
      <section className="flex flex-col gap-y-2">
        <h2 className="text-[11px] lowercase">loops</h2>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {LOOP_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={Boolean(runningLoops[name])}
              className={cn(
                BUTTON_CLASS,
                runningLoops[name] &&
                  "border-[var(--lm-accent-hi)] text-[var(--lm-accent-hi)]"
              )}
              onClick={() => handleToggleLoop(name)}
            >
              {name}
              <SourceTag sample={sampleNames.includes(name)} />
            </button>
          ))}
        </div>
      </section>
      <button
        type="button"
        aria-pressed={muted}
        className={cn(
          BUTTON_CLASS,
          "self-start",
          muted && "border-[var(--lm-accent-hi)] text-[var(--lm-accent-hi)]"
        )}
        onClick={handleToggleMute}
      >
        {muted ? "muted" : "mute"}
      </button>
    </div>
  );
}
