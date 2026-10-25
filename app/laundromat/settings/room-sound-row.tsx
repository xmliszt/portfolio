"use client";

import { useEffect, useRef } from "react";
import { useSpring } from "motion/react";

import { RotarySwitchDial } from "@/app/laundromat/rotary-switch-dial";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import { cn } from "@/lib/utils";

import { RoomSoundFader } from "./room-sound-fader";
import { RoomSoundScope } from "./room-sound-scope";
import { SETTINGS_META_CLASS } from "./settings-meta-class";

const DIAL_SPRING = { visualDuration: 0.38, bounce: 0.28 };
const FADER_SPRING = { visualDuration: 0.42, bounce: 0.12 };
const DETENT = { at: 0.5, volume: 0.6 };

type RoomSoundRowProps = {
  group: RoomSoundGroup;
  label: string;
  hint: string;
  offLabel: string;
  onLabel: string;
  volumeLabel: string;
  on: boolean;
  volume: number;
  live: boolean;
  still: boolean;
  delayMs: number;
  getLiveAmplitude: () => number | undefined;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
};

/** Render one room sound as a switch row (a CRT scope, its name and hint, and a dial that turns after `delayMs` and clicks as it passes halfway) over a fader for its volume that glides after `delayMs`; both jump silently when `still`. */
export function RoomSoundRow(props: RoomSoundRowProps) {
  const sound = useSoundBoard();
  const turn = useSpring(props.on ? 1 : 0, DIAL_SPRING);
  const level = useSpring(props.volume, FADER_SPRING);
  const isAdjustingRef = useRef(false);
  const { on, volume, still, delayMs } = props;

  useEffect(() => {
    const target = on ? 1 : 0;
    if (still) {
      turn.jump(target);
      return;
    }
    const timer = window.setTimeout(() => turn.set(target), delayMs);
    return () => window.clearTimeout(timer);
  }, [turn, on, still, delayMs]);

  useEffect(() => {
    if (still || isAdjustingRef.current) {
      level.jump(volume);
      return;
    }
    const timer = window.setTimeout(() => level.set(volume), delayMs);
    return () => window.clearTimeout(timer);
  }, [level, volume, still, delayMs]);

  function handleAdjustStart() {
    isAdjustingRef.current = true;
    props.onAdjustStart();
  }

  function handleAdjustEnd() {
    isAdjustingRef.current = false;
    props.onAdjustEnd();
  }

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
    <div className="flex flex-col rounded-md transition-colors hover:bg-[color-mix(in_oklab,var(--lm-ink)_6%,transparent)]">
      <button
        type="button"
        role="switch"
        aria-checked={props.on}
        onClick={props.onToggle}
        className="group grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md pt-2 pr-1 pb-1 pl-1.5 text-left outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)] @max-[289px]:gap-y-0.5 @max-[289px]:[grid-template-areas:'scope_label_dial'_'scope_hint_hint']"
      >
        <span className="@max-[289px]:self-start @max-[289px]:[grid-area:scope]">
          <RoomSoundScope
            group={props.group}
            turn={turn}
            level={level}
            getLiveAmplitude={props.getLiveAmplitude}
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
              "opacity-80 @max-[289px]:self-start @max-[289px]:[grid-area:hint]"
            )}
          >
            {props.hint}
          </span>
        </span>
        <span className="@max-[289px]:[grid-area:dial]">
          <RotarySwitchDial
            turn={turn}
            on={props.on}
            offLabel={props.offLabel}
            onLabel={props.onLabel}
          />
        </span>
      </button>
      <span className="pr-1 pb-1.5 pl-[86px] @max-[289px]:pt-0.5 @max-[289px]:pb-2 @max-[289px]:pl-1.5">
        <RoomSoundFader
          label={props.volumeLabel}
          volume={props.volume}
          level={level}
          on={props.on}
          live={props.live}
          still={props.still}
          onChange={props.onVolumeChange}
          onAdjustStart={handleAdjustStart}
          onAdjustEnd={handleAdjustEnd}
        />
      </span>
    </div>
  );
}
