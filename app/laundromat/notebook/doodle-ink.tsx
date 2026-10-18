"use client";

import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";

const MIN_STROKE_MS = 60;
const STROKE_GAP_MS = 90;

type DoodleInkProps = {
  strokes: DoodleStroke[];
  strokeWidthPx: number;
  ink: "plain" | "inking" | "waiting";
  speed: number;
  opacity: number;
  onComplete: (() => void) | undefined;
};

export function DoodleInk(props: DoodleInkProps) {
  const isInking = props.ink === "inking";
  const timeline = props.strokes.reduce<{
    startMs: number;
    items: { delayMs: number; durationMs: number }[];
  }>(
    (acc, stroke) => {
      const durationMs = Math.max(
        MIN_STROKE_MS,
        stroke.durationMs / props.speed
      );
      return {
        startMs: acc.startMs + durationMs + STROKE_GAP_MS / props.speed,
        items: [...acc.items, { delayMs: acc.startMs, durationMs }],
      };
    },
    { startMs: 0, items: [] }
  );
  const lastIndex = props.strokes.length - 1;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      style={{ opacity: props.ink === "waiting" ? 0 : props.opacity }}
    >
      {props.strokes.map((stroke, index) => {
        const { delayMs, durationMs } = timeline.items[index];
        const onAnimationEnd =
          isInking && index === lastIndex ? props.onComplete : undefined;
        const [x, y] = stroke.points[0];
        if (stroke.points.length === 1) {
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={props.strokeWidthPx * 0.7}
              fill="var(--lm-ink-pen)"
              style={
                isInking
                  ? {
                      opacity: 0,
                      animation: `lm-doodle-dot 1ms linear ${delayMs}ms forwards`,
                    }
                  : undefined
              }
              onAnimationEnd={onAnimationEnd}
            />
          );
        }
        return (
          <path
            key={index}
            d={toStrokePath(stroke.points)}
            pathLength={1}
            fill="none"
            stroke="var(--lm-ink-pen)"
            strokeWidth={props.strokeWidthPx}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              isInking
                ? {
                    strokeDasharray: "1 1",
                    strokeDashoffset: 1,
                    animation: `lm-doodle-ink ${durationMs}ms linear ${delayMs}ms forwards`,
                  }
                : undefined
            }
            onAnimationEnd={onAnimationEnd}
          />
        );
      })}
    </svg>
  );
}
