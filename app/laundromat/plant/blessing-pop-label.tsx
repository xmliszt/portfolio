"use client";

import type { BlessingPop } from "./use-plant-streak";

const DURATION_MS = 1600;

type BlessingPopLabelProps = {
  pop: BlessingPop;
  reducedMotion: boolean;
  onDone: () => void;
};

/** A blessing label that bounces up out of the plant at the pop's anchor, drifts and fades, then calls `onDone`. */
export function BlessingPopLabel(props: BlessingPopLabelProps) {
  const { anchor, driftPx, liftPx, tiltDeg } = props.pop;
  const style: React.CSSProperties & {
    "--lm-drift": string;
    "--lm-lift": string;
    "--lm-tilt": string;
  } = {
    left: anchor.x,
    top: anchor.y,
    "--lm-drift": `${driftPx}px`,
    "--lm-lift": `${liftPx}px`,
    "--lm-tilt": `${tiltDeg}deg`,
  };
  const fade = `lm-blessing-fade ${DURATION_MS}ms ease-out both`;

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "lm-blessing-fade") props.onDone();
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
      style={style}
    >
      <div
        className="rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-2.5 py-1.5 text-[11px] leading-none font-medium whitespace-nowrap text-[var(--lm-ink-hi)]"
        style={
          props.reducedMotion
            ? {
                animation: fade,
                transform: "translateY(calc(var(--lm-lift) * -1))",
              }
            : {
                animation: `lm-blessing-pop ${DURATION_MS}ms ease-out both, ${fade}`,
              }
        }
        onAnimationEnd={handleAnimationEnd}
      >
        {props.pop.text}
      </div>
    </div>
  );
}
