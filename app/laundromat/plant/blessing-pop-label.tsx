"use client";

import { motion } from "motion/react";

import type { BlessingPop } from "./use-plant-streak";

const START_PX = 28;

type BlessingPopLabelProps = {
  pop: BlessingPop;
  anchor: { x: number; y: number };
  reducedMotion: boolean;
  onDone: () => void;
};

/** A blessing label that bounces up out of the plant at `anchor`, drifts and fades, then calls `onDone`. */
export function BlessingPopLabel(props: BlessingPopLabelProps) {
  const { driftPx, liftPx, tiltDeg } = props.pop;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
      style={{ left: props.anchor.x, top: props.anchor.y }}
    >
      <motion.div
        className="rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-2.5 py-1.5 text-[11px] leading-none font-medium whitespace-nowrap text-[var(--lm-ink-hi)]"
        initial={
          props.reducedMotion
            ? { opacity: 0, y: -liftPx }
            : { opacity: 0, scale: 0.3, y: START_PX }
        }
        animate={
          props.reducedMotion
            ? { opacity: [0, 1, 1, 0] }
            : {
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.22, 0.9, 1.05, 1],
                y: [
                  START_PX,
                  -liftPx - 22,
                  -liftPx + 6,
                  -liftPx - 4,
                  -liftPx - 44,
                ],
                x: [0, driftPx * 0.6, driftPx * 0.85, driftPx, driftPx * 1.3],
                rotate: [
                  -tiltDeg,
                  tiltDeg,
                  -tiltDeg * 0.5,
                  tiltDeg * 0.25,
                  tiltDeg * 0.5,
                ],
              }
        }
        transition={{
          duration: props.reducedMotion ? 1.2 : 1.6,
          times: props.reducedMotion
            ? [0, 0.15, 0.7, 1]
            : [0, 0.18, 0.3, 0.4, 1],
          ease: "easeOut",
          opacity: { duration: 1.6, times: [0, 0.08, 0.75, 1] },
        }}
        onAnimationComplete={props.onDone}
      >
        {props.pop.text}
      </motion.div>
    </div>
  );
}
