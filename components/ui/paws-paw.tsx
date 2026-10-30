"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

const TOES = [
  { cx: 15.5, cy: 27, rx: 5.4, ry: 6.6, rotate: -18 },
  { cx: 25.5, cy: 17.5, rx: 5.6, ry: 7, rotate: -6 },
  { cx: 38.5, cy: 17.5, rx: 5.6, ry: 7, rotate: 6 },
  { cx: 48.5, cy: 27, rx: 5.4, ry: 6.6, rotate: 18 },
] as const;
const PAD = { cx: 32, cy: 41, rx: 12.5, ry: 10.5 } as const;
const INKS = { blue: "#2c68b2", pink: "#e8577f" } as const;
const POP = { type: "spring", visualDuration: 0.35, bounce: 0.55 } as const;
const TOE_STAGGER_S = 0.07;
const PAT = { durationS: 1.6, delayS: 0.6 } as const;

function PawShapes() {
  return (
    <>
      <ellipse cx={PAD.cx} cy={PAD.cy} rx={PAD.rx} ry={PAD.ry} />
      {TOES.map((toe) => (
        <ellipse
          key={toe.cx}
          cx={toe.cx}
          cy={toe.cy}
          rx={toe.rx}
          ry={toe.ry}
          transform={`rotate(${toe.rotate} ${toe.cx} ${toe.cy})`}
        />
      ))}
    </>
  );
}

/** Render the Paws riso paw print, a pink pass over a slightly shifted blue one, that presses in toe by toe and then pats now and then. */
export function PawsPaw() {
  const inkId = useId();
  const isReduced = useReducedMotion() ?? false;
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 64 64"
      className="size-24 overflow-visible"
      style={{ transformOrigin: "50% 80%" }}
      animate={
        isReduced ? undefined : { scaleY: [1, 0.9, 1.04, 1], y: [0, 2, -1, 0] }
      }
      transition={{
        duration: 0.45,
        repeat: Infinity,
        repeatDelay: PAT.durationS,
        delay: PAT.delayS,
      }}
    >
      <defs>
        <filter id={inkId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="1"
            seed="4"
            result="wobble"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wobble"
            scale="1.4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2.4"
            numOctaves="2"
            seed="9"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -5 0 0 0 4.1"
            result="speckle"
          />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </defs>
      {[
        { fill: INKS.blue, shift: "translate(2.2 1.7)" },
        { fill: INKS.pink, shift: undefined },
      ].map((pass) => (
        <g
          key={pass.fill}
          fill={pass.fill}
          transform={pass.shift}
          filter={`url(#${inkId})`}
        >
          {isReduced ? (
            <PawShapes />
          ) : (
            [PAD, ...TOES].map((shape, index) => (
              <motion.ellipse
                key={shape.cx + shape.cy}
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                transform={
                  "rotate" in shape
                    ? `rotate(${shape.rotate} ${shape.cx} ${shape.cy})`
                    : undefined
                }
                style={{ transformOrigin: `${shape.cx}px ${shape.cy}px` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...POP, delay: index * TOE_STAGGER_S }}
              />
            ))
          )}
        </g>
      ))}
    </motion.svg>
  );
}
