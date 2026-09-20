"use client";

import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * MOIRÉ MARK
 *
 * Two ring families, the same circles twice, after Moiré's own
 * icon.svg. Everything visible here is the gap between them:
 * slide one across the other and a third pattern appears that
 * is in neither.
 *
 *    0ms   both families stacked — offset 0, no interference
 *  300ms   the families separate 0 → 120px, the fringes resolve
 *  after   the offset drifts ±40px on a 9s cycle, or tracks
 *          the pointer on devices that have one
 * ───────────────────────────────────────────────────────── */

export type MarkConfig = {
  ringCount: number;
  radiusMin: number; // px, innermost circle
  radiusStep: number; // px between rings
  strokeWidth: number;
  restOffset: number; // px between the two families at rest
  driftAmount: number; // px the drift travels either side of rest
  driftSeconds: number; // one full drift cycle
  pointerRange: number; // px of offset the pointer can reach across the hero
  opacityA: number;
  opacityB: number;
  /* Family B. Family A is always currentColor, so it flips with the theme
     on its own; B needs a value per theme, after Moiré's own --star token. */
  accent: string;
  accentDark: string;
};

/*
  Ring spacing is the whole trick. The icon's seven wide rings read as a
  wordmark; fringes only appear once the spacing is small relative to the
  radius, so the mark uses many more, much finer rings than the logo does.
*/
export const MARK: MarkConfig = {
  ringCount: 30,
  radiusMin: 7,
  radiusStep: 7,
  strokeWidth: 1.2,
  restOffset: 120,
  driftAmount: 40,
  driftSeconds: 9,
  pointerRange: 140,
  opacityA: 1,
  opacityB: 0.85,
  accent: "#3f6f9c",
  accentDark: "#7ba7d4",
};

const VIEWBOX = 512;
const CENTER = VIEWBOX / 2;

/** Entrance: how long the two families stay stacked before separating. */
const TIMING = { separate: 300 };

const SPRING = { stiffness: 120, damping: 24, mass: 1 };

type MoireMarkProps = {
  config?: Partial<MarkConfig>;
  className?: string;
};

export function MoireMark(props: MoireMarkProps) {
  const config = { ...MARK, ...props.config };
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOffset = useRef<number | undefined>(undefined);
  const [separated, setSeparated] = useState(false);

  const offset = useMotionValue(0);
  const smoothOffset = useSpring(offset, SPRING);
  const xa = useTransform(smoothOffset, (value) => -value / 2);
  const xb = useTransform(smoothOffset, (value) => value / 2);

  useAnimationFrame((elapsedMs) => {
    if (!separated && elapsedMs >= TIMING.separate) setSeparated(true);
    if (elapsedMs < TIMING.separate) return;

    if (pointerOffset.current !== undefined) {
      offset.set(pointerOffset.current);
      return;
    }
    if (reduceMotion) {
      offset.set(config.restOffset);
      return;
    }
    const phase = (elapsedMs / (config.driftSeconds * 1000)) * Math.PI * 2;
    offset.set(config.restOffset + Math.sin(phase) * config.driftAmount);
  });

  const radii = Array.from(
    { length: config.ringCount },
    (_, index) => config.radiusMin + index * config.radiusStep
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const ratio = (event.clientX - bounds.left) / bounds.width;
    pointerOffset.current = ratio * config.pointerRange;
  }

  function handlePointerLeave() {
    pointerOffset.current = undefined;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--moire-accent-light": config.accent,
          "--moire-accent-dark": config.accentDark,
        } as React.CSSProperties
      }
      className={cn(
        "relative mx-auto w-full max-w-[300px] touch-none select-none",
        "[--moire-accent:var(--moire-accent-light)]",
        "dark:[--moire-accent:var(--moire-accent-dark)]",
        props.className
      )}
      aria-hidden
    >
      <motion.svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-auto w-full overflow-visible"
      >
        <defs>
          {/* userSpaceOnUse so the fade stays put while the families slide,
              and so the mask region can be wider than the viewBox without
              moving it. At full offset the rings travel past the viewBox
              edge, and a mask region that stopped there would cut them. */}
          <radialGradient
            id="moire-mark-fade"
            gradientUnits="userSpaceOnUse"
            cx={CENTER}
            cy={CENTER}
            r={CENTER}
          >
            <stop offset="72%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask
            id="moire-mark-mask"
            maskUnits="userSpaceOnUse"
            x={-VIEWBOX}
            y={-VIEWBOX}
            width={VIEWBOX * 3}
            height={VIEWBOX * 3}
          >
            <rect
              x={-VIEWBOX}
              y={-VIEWBOX}
              width={VIEWBOX * 3}
              height={VIEWBOX * 3}
              fill="url(#moire-mark-fade)"
            />
          </mask>
        </defs>

        <g
          fill="none"
          strokeWidth={config.strokeWidth}
          mask="url(#moire-mark-mask)"
        >
          <motion.g
            style={{ x: xa }}
            stroke="currentColor"
            opacity={config.opacityA}
          >
            {radii.map((radius) => (
              <circle key={radius} cx={CENTER} cy={CENTER} r={radius} />
            ))}
          </motion.g>
          <motion.g
            style={{ x: xb }}
            stroke="var(--moire-accent)"
            opacity={config.opacityB}
          >
            {radii.map((radius) => (
              <circle key={radius} cx={CENTER} cy={CENTER} r={radius} />
            ))}
          </motion.g>
        </g>
      </motion.svg>
    </div>
  );
}
