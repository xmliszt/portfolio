"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useTransform } from "motion/react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { ROOM_SOUND_VOLUME } from "@/lib/laundromat/audio/room-sound-groups";
import { cn } from "@/lib/utils";

import { SETTINGS_META_CLASS } from "./settings-meta-class";

const CAP_WIDTH_PX = 14;
const SNAP = { within: 0.04, clickVolume: 0.4 };
const KEY_RELEASE_MS = 600;
const TICKS = [0, 0.5, 1, 1.5];
const KEY_STEPS: { [key: string]: number } = {
  ArrowLeft: -0.05,
  ArrowDown: -0.05,
  ArrowRight: 0.05,
  ArrowUp: 0.05,
  PageDown: -0.25,
  PageUp: 0.25,
  Home: -ROOM_SOUND_VOLUME.max,
  End: ROOM_SOUND_VOLUME.max,
};

type RoomSoundFaderProps = {
  label: string;
  volume: number;
  level: MotionValue<number>;
  on: boolean;
  live: boolean;
  still: boolean;
  onChange: (volume: number) => void;
  onAdjustStart: () => void;
  onAdjustEnd: () => void;
};

function toPositionCss(volume: number) {
  return `calc((100% - ${CAP_WIDTH_PX}px) * ${volume / ROOM_SOUND_VOLUME.max})`;
}

/** Render a horizontal fader for one room sound's volume, from `ROOM_SOUND_VOLUME.min` to `ROOM_SOUND_VOLUME.max`, whose cap follows `level`, snaps to `ROOM_SOUND_VOLUME.usual` with a click when dragged near it, and steps by `KEY_STEPS` from the keyboard. */
export function RoomSoundFader(props: RoomSoundFaderProps) {
  const sound = useSoundBoard();
  const capLeft = useTransform(props.level, toPositionCss);
  const fillWidth = useTransform(
    props.level,
    (volume) => `calc(${CAP_WIDTH_PX / 2}px + ${toPositionCss(volume)})`
  );
  const keyReleaseRef = useRef<number>(undefined);
  const isPressedRef = useRef(false);

  useEffect(() => () => window.clearTimeout(keyReleaseRef.current), []);

  function commit(next: number) {
    if (next === props.volume) return;
    if (next === ROOM_SOUND_VOLUME.usual && !props.still) {
      sound?.play("knob-click", { volume: SNAP.clickVolume });
    }
    props.onChange(next);
  }

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(event.currentTarget.value) / 100;
    const isNearUsual = Math.abs(raw - ROOM_SOUND_VOLUME.usual) <= SNAP.within;
    commit(isNearUsual ? ROOM_SOUND_VOLUME.usual : raw);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLInputElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    isPressedRef.current = true;
    props.onAdjustStart();
  }

  function handlePointerEnd() {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;
    props.onAdjustEnd();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const step = KEY_STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const stepped = Math.round((props.volume + step) * 100) / 100;
    commit(
      Math.min(ROOM_SOUND_VOLUME.max, Math.max(ROOM_SOUND_VOLUME.min, stepped))
    );
    props.onAdjustStart();
    window.clearTimeout(keyReleaseRef.current);
    keyReleaseRef.current = window.setTimeout(
      props.onAdjustEnd,
      KEY_RELEASE_MS
    );
  }

  const percent = Math.round(props.volume * 100);

  return (
    <span
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_4ch] items-center gap-x-2.5 transition-opacity duration-200",
        !props.on && "opacity-40"
      )}
    >
      <span className="relative block h-7 pointer-coarse:h-9">
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-[2px] bg-[color-mix(in_oklab,var(--lm-ink)_10%,#0a0b0c)] shadow-[inset_0_1px_1px_rgb(0_0_0/0.8),0_1px_0_rgb(255_255_255/0.04)]"
        />
        <motion.span
          aria-hidden
          style={{ width: fillWidth }}
          className={cn(
            "absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-[2px] bg-[linear-gradient(90deg,color-mix(in_oklab,var(--lm-accent)_45%,transparent),var(--lm-accent))] transition-[filter] duration-200",
            props.on
              ? "shadow-[0_0_6px_color-mix(in_oklab,var(--lm-accent)_45%,transparent)]"
              : "brightness-75 grayscale"
          )}
        />
        {TICKS.map((volume) => (
          <span
            key={volume}
            aria-hidden
            style={{
              left: `calc(${CAP_WIDTH_PX / 2}px + ${toPositionCss(volume)})`,
            }}
            className={cn(
              "absolute top-1/2 w-px translate-y-1",
              volume === ROOM_SOUND_VOLUME.usual
                ? "h-1.5 bg-[var(--lm-ink)]"
                : "h-1 bg-[var(--lm-line)]"
            )}
          />
        ))}
        <input
          type="range"
          min={ROOM_SOUND_VOLUME.min * 100}
          max={ROOM_SOUND_VOLUME.max * 100}
          step={1}
          value={percent}
          aria-label={props.label}
          aria-valuetext={`${percent}%`}
          onChange={handleInput}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onLostPointerCapture={handlePointerEnd}
          onKeyDown={handleKeyDown}
          className="peer absolute inset-0 m-0 size-full cursor-pointer touch-pan-y appearance-none bg-transparent opacity-0 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none"
        />
        <motion.span
          aria-hidden
          style={{ left: capLeft }}
          className="pointer-events-none absolute top-1/2 -mt-2.5 h-5 w-3.5 rounded-[4px] bg-[repeating-linear-gradient(90deg,#2e3033_0_2px,#1c1d1f_2px_4px)] shadow-[0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.08),0_2px_4px_rgb(0_0_0/0.6)] transition-[scale] duration-150 peer-focus-visible:shadow-[0_0_0_1px_#000,0_0_0_3px_var(--lm-edge),0_0_0_4px_var(--lm-line)] peer-active:scale-[0.94]"
        >
          <span
            className={cn(
              "absolute top-1/2 left-1/2 -mt-[4.5px] -ml-px h-[9px] w-0.5 rounded-[1px] transition-colors duration-300",
              props.on ? "bg-[var(--lm-accent)]" : "bg-[var(--lm-ink-hi)]"
            )}
          />
        </motion.span>
      </span>
      <span
        aria-hidden
        className={cn(
          SETTINGS_META_CLASS,
          "text-right whitespace-nowrap transition-[color,opacity] duration-200",
          props.live ? "text-[var(--lm-accent)]" : "opacity-60"
        )}
      >
        {percent}%
      </span>
    </span>
  );
}
