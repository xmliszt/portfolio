"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { SETTINGS_LCD_CLASS } from "./settings-lcd-class";

const METER_CELLS = 12;
const HOT_CELLS = 2;
const METER_GAIN = 2.4;
const STILL_LIT_CELLS = 6;

type RoomMixDeckProps = {
  playing: boolean;
  still: boolean;
  label: string;
  playingLabel: string;
  playLabel: string;
  stopLabel: string;
  getLevel: () => number;
  onToggle: () => void;
};

/** Render the room mix player: a round play key, a small amber display saying whether the mix plays, and a level meter that follows `getLevel` while `playing`, or stays half lit when `still`. */
export function RoomMixDeck(props: RoomMixDeckProps) {
  const meterRef = useRef<HTMLSpanElement>(null);
  const { playing, still, getLevel } = props;
  const getLevelRef = useRef(getLevel);
  useEffect(() => {
    getLevelRef.current = getLevel;
  });

  useEffect(() => {
    const cells = [...(meterRef.current?.children ?? [])];
    function light(count: number) {
      cells.forEach((cell, index) => {
        cell.toggleAttribute("data-lit", index < count);
      });
    }
    if (!playing) {
      light(0);
      return;
    }
    if (still) {
      light(STILL_LIT_CELLS);
      return () => light(0);
    }
    const frame = { id: 0 };
    function tick() {
      const level = Math.min(1, Math.sqrt(getLevelRef.current()) * METER_GAIN);
      light(Math.round(level * METER_CELLS));
      frame.id = requestAnimationFrame(tick);
    }
    frame.id = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.id);
      light(0);
    };
  }, [playing, still]);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-[linear-gradient(180deg,var(--lm-housing-top),var(--lm-housing-bottom))] p-2.5 shadow-[inset_0_0_0_1px_var(--lm-control-edge),inset_0_1px_0_rgb(255_255_255/0.05),0_1px_0_rgb(255_255_255/0.03)]">
      <button
        type="button"
        aria-pressed={props.playing}
        aria-label={props.playing ? props.stopLabel : props.playLabel}
        onClick={props.onToggle}
        className="relative size-10 cursor-pointer rounded-full bg-[repeating-conic-gradient(var(--lm-key-top)_0_7deg,var(--lm-key-bottom)_7deg_14deg)] shadow-[0_0_0_1px_var(--lm-control-edge),0_2px_4px_rgb(0_0_0/0.6)] transition-[scale] duration-150 outline-none focus-visible:shadow-[0_0_0_1px_var(--lm-control-edge),0_0_0_3px_var(--lm-line)] active:scale-[0.94]"
      >
        <span className="absolute inset-[5px] rounded-full bg-[radial-gradient(circle_at_40%_30%,var(--lm-key-top),var(--lm-key-bottom)_70%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "absolute inset-0 m-auto size-3 transition-[fill] duration-200",
            props.playing
              ? "fill-[var(--lm-accent)] drop-shadow-[0_0_4px_var(--lm-accent)]"
              : "fill-[var(--lm-ink-hi)]"
          )}
        >
          {props.playing ? (
            <rect x="3" y="3" width="6" height="6" rx="1" />
          ) : (
            <path d="M3.5 2.2v7.6L10 6z" />
          )}
        </svg>
      </button>
      <span className="flex min-w-0 flex-col gap-y-1.5">
        <span aria-live="polite" className={SETTINGS_LCD_CLASS}>
          {props.playing ? props.playingLabel : props.label}
        </span>
        <span
          ref={meterRef}
          aria-hidden
          className="grid h-[5px] grid-cols-12 gap-x-0.5"
        >
          {Array.from({ length: METER_CELLS }, (_, index) => (
            <i
              key={index}
              className={cn(
                "rounded-[1px] bg-[#24190e] transition-colors duration-75",
                index < METER_CELLS - HOT_CELLS
                  ? "data-[lit]:bg-[var(--lm-accent)]"
                  : "data-[lit]:bg-[var(--lm-accent-hi)]",
                "data-[lit]:shadow-[0_0_4px_color-mix(in_oklab,var(--lm-accent)_70%,transparent)]"
              )}
            />
          ))}
        </span>
      </span>
    </div>
  );
}
