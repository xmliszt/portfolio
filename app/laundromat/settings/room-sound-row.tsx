"use client";

import { useEffect, useRef } from "react";
import { useSpring } from "motion/react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import { cn } from "@/lib/utils";

import { RoomSoundDial } from "./room-sound-dial";
import { RoomSoundScope } from "./room-sound-scope";
import { SETTINGS_META_CLASS } from "./settings-meta-class";

const DIAL_SPRING = { visualDuration: 0.38, bounce: 0.28 };
const DETENT = { at: 0.5, volume: 0.6 };

type RoomSoundRowProps = {
  group: RoomSoundGroup;
  label: string;
  hint: string;
  offLabel: string;
  onLabel: string;
  on: boolean;
  still: boolean;
  delayMs: number;
  onToggle: () => void;
};

/** Render one room sound as a switch row: a CRT scope, its name and hint, and a dial that turns after `delayMs` and clicks as it passes halfway, or jumps silently when `still`. */
export function RoomSoundRow(props: RoomSoundRowProps) {
  const sound = useSoundBoard();
  const turn = useSpring(props.on ? 1 : 0, DIAL_SPRING);
  const { on, still, delayMs } = props;

  useEffect(() => {
    const target = on ? 1 : 0;
    if (still) {
      turn.jump(target);
      return;
    }
    const timer = window.setTimeout(() => turn.set(target), delayMs);
    return () => window.clearTimeout(timer);
  }, [turn, on, still, delayMs]);

  const previousTurnRef = useRef(turn.get());
  useEffect(() => {
    if (still) return;
    previousTurnRef.current = turn.get();
    return turn.on("change", (value) => {
      const previous = previousTurnRef.current;
      previousTurnRef.current = value;
      if ((previous - DETENT.at) * (value - DETENT.at) < 0) {
        sound?.play("knob-click", { volume: DETENT.volume });
      }
    });
  }, [turn, sound, still]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.on}
      onClick={props.onToggle}
      className="group grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md py-2 pr-1 pl-1.5 text-left transition-colors outline-none hover:bg-[color-mix(in_oklab,var(--lm-ink)_6%,transparent)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)] @max-[289px]:gap-y-0.5 @max-[289px]:[grid-template-areas:'scope_label_dial'_'scope_hint_hint']"
    >
      <span className="@max-[289px]:self-start @max-[289px]:[grid-area:scope]">
        <RoomSoundScope
          group={props.group}
          turn={turn}
          on={props.on}
          still={props.still}
          delayMs={props.delayMs}
        />
      </span>
      <span className="flex min-w-0 flex-col gap-y-0.5 @max-[289px]:contents">
        <span
          className={cn(
            "text-[13px] leading-5 lowercase transition-colors duration-200 @max-[289px]:self-end @max-[289px]:[grid-area:label]",
            props.on && "text-[var(--lm-ink-hi)]"
          )}
        >
          {props.label}
        </span>
        <span
          className={cn(
            SETTINGS_META_CLASS,
            "opacity-60 @max-[289px]:self-start @max-[289px]:[grid-area:hint]"
          )}
        >
          {props.hint}
        </span>
      </span>
      <span className="@max-[289px]:[grid-area:dial]">
        <RoomSoundDial
          turn={turn}
          on={props.on}
          offLabel={props.offLabel}
          onLabel={props.onLabel}
        />
      </span>
    </button>
  );
}
