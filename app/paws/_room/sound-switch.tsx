"use client";

import { motion, useReducedMotion } from "motion/react";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { cn } from "@/lib/utils";

const SLIDE = { type: "spring", stiffness: 600, damping: 32 } as const;

type SoundSwitchProps = {
  muted: boolean;
  label: string;
  onToggle: () => void;
};

/** Render the room's mute switch: a speaker icon and a riso toggle that shows yellow while sound plays; as a switch it is checked while `muted`. */
export function SoundSwitch(props: SoundSwitchProps) {
  const isReduced = useReducedMotion() ?? false;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.muted}
      aria-label={props.label}
      onClick={props.onToggle}
      className={cn(
        FOCUS_RING_CLASS,
        "flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2 text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M2.5 6h2.5l3.5-3v10l-3.5-3h-2.5z" fill="currentColor" />
        {props.muted ? (
          <path d="M11 6l3.5 4M14.5 6l-3.5 4" />
        ) : (
          <>
            <path d="M11 6.2a2.5 2.5 0 0 1 0 3.6" />
            <path d="M12.8 4.4a5 5 0 0 1 0 7.2" />
          </>
        )}
      </svg>
      <span
        aria-hidden
        className={cn(
          "relative h-4 w-7 border-[1.5px] border-[var(--pw-ink)] transition-colors",
          props.muted ? "bg-[var(--pw-paper-deep)]" : "bg-[var(--pw-yellow)]"
        )}
      >
        <motion.span
          className="absolute top-[1px] size-[11px] bg-[var(--pw-ink)]"
          initial={false}
          animate={{ left: props.muted ? 1 : 12 }}
          transition={isReduced ? { duration: 0 } : SLIDE}
        />
      </span>
    </button>
  );
}
