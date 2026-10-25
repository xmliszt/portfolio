"use client";

import type { MotionValue } from "motion/react";
import { motion, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

const POINTER_SWEEP_DEG = 60;

type RotarySwitchDialProps = {
  turn: MotionValue<number>;
  on: boolean;
  offLabel: string;
  onLabel: string;
};

export function RotarySwitchDial(props: RotarySwitchDialProps) {
  const rotate = useTransform(
    props.turn,
    [0, 1],
    [-POINTER_SWEEP_DEG, POINTER_SWEEP_DEG],
    { clamp: false }
  );
  const glow = useTransform(props.turn, [0.5, 1], [0, 1]);

  return (
    <span
      aria-hidden
      className="relative block h-10 w-14 @max-[289px]:h-[30px] @max-[289px]:w-12"
    >
      <span className="absolute top-1/2 left-0.5 -mt-0.5 size-1 rounded-full bg-[var(--lm-line)]" />
      <span className="absolute top-1/2 right-0.5 -mt-0.5 size-1 rounded-full bg-[var(--lm-line)]" />
      <motion.span
        style={{ opacity: glow }}
        className="absolute top-1/2 right-0.5 -mt-0.5 size-1 rounded-full bg-[var(--lm-accent)] shadow-[0_0_8px_var(--lm-accent)]"
      />
      <span className="absolute top-1/2 left-1/2 -mt-[13px] -ml-[13px] size-[26px] transition-[scale] duration-150 group-active:scale-[0.94] motion-reduce:transition-none">
        <motion.span
          style={{ rotate }}
          className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(var(--lm-key-top)_0_7deg,var(--lm-key-bottom)_7deg_14deg)] shadow-[0_0_0_1px_var(--lm-control-edge),0_2px_4px_rgb(0_0_0/0.6)]"
        >
          <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_40%_30%,var(--lm-key-top),var(--lm-key-bottom)_70%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" />
          <span
            className={cn(
              "absolute top-[5px] left-1/2 -ml-px h-[7px] w-0.5 rounded-[1px] transition-colors duration-300",
              props.on ? "bg-[var(--lm-accent)]" : "bg-[var(--lm-ink-hi)]"
            )}
          />
        </motion.span>
      </span>
      <span className="absolute -bottom-1 left-0 text-[9px] leading-[10px] opacity-55 @max-[289px]:hidden">
        {props.offLabel}
      </span>
      <span className="absolute right-0 -bottom-1 text-[9px] leading-[10px] opacity-55 @max-[289px]:hidden">
        {props.onLabel}
      </span>
    </span>
  );
}
