"use client";

import { useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { Transition } from "motion/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FLIGHT = {
  angleDeg: [-160, -20],
  distancePx: [16, 32],
  minLiftPx: 6,
  tiltDeg: [6, 18],
  windUp: 1.6,
  launchScale: 0.3,
} as const;

const ENTER = {
  x: { type: "spring", visualDuration: 0.5, bounce: 0.35 },
  y: { type: "spring", visualDuration: 0.42, bounce: 0.4 },
  scale: { type: "spring", visualDuration: 0.32, bounce: 0.55 },
  rotate: { type: "spring", visualDuration: 0.6, bounce: 0.6 },
  opacity: { duration: 0.12, ease: "easeOut" },
} satisfies { [key: string]: Transition };

const RETURN = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1],
} satisfies Transition;

const FLOAT = { yPx: 3, tiltDeg: 1.5, durationS: 2.8, delayS: 0.5 };

function pickBetween(range: readonly [number, number]) {
  return range[0] + Math.random() * (range[1] - range[0]);
}

/** Return a random offset with `y <= -FLIGHT.minLiftPx` and a `rotate` whose sign matches `x`. */
function pickFlight() {
  const angle = (pickBetween(FLIGHT.angleDeg) * Math.PI) / 180;
  const distance = pickBetween(FLIGHT.distancePx);
  const x = Math.cos(angle) * distance;
  const y = Math.min(Math.sin(angle) * distance, -FLIGHT.minLiftPx);
  const direction = Math.sign(x) || 1;
  return { x, y, rotate: direction * pickBetween(FLIGHT.tiltDeg) };
}

type FlyingContentProps = {
  children: React.ReactNode;
};

function FlyingContent(props: FlyingContentProps) {
  const [flight] = useState(pickFlight);
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, ...flight }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={ENTER.opacity}
      >
        {props.children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{
        x: 0,
        y: 0,
        scale: FLIGHT.launchScale,
        rotate: -flight.rotate * FLIGHT.windUp,
        opacity: 0,
      }}
      animate={{ ...flight, scale: 1, opacity: 1 }}
      exit={{
        x: 0,
        y: 0,
        scale: FLIGHT.launchScale,
        rotate: 0,
        opacity: 0,
        transition: RETURN,
      }}
      transition={ENTER}
      style={{ originY: 1 }}
    >
      <motion.div
        animate={{
          y: [0, -FLOAT.yPx, 0],
          rotate: [0, Math.sign(flight.rotate) * FLOAT.tiltDeg, 0],
        }}
        transition={{
          duration: FLOAT.durationS,
          delay: FLOAT.delayS,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {props.children}
      </motion.div>
    </motion.div>
  );
}

type FlyOutTooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  label: string;
};

/** Wrap a link so hovering it springs `content` out of the link's end in a random upward direction. */
export function FlyOutTooltip(props: FlyOutTooltipProps) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setOpenCount((count) => count + 1);
  }

  return (
    <TooltipPrimitive.Provider delayDuration={0} disableHoverableContent>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <TooltipPrimitive.Trigger asChild>
          {props.children}
        </TooltipPrimitive.Trigger>
        <AnimatePresence>
          {open && (
            <TooltipPrimitive.Portal key={openCount} forceMount>
              <TooltipPrimitive.Content
                forceMount
                side="top"
                align="end"
                avoidCollisions={false}
                aria-label={props.label}
                className="pointer-events-none z-50"
              >
                <div className="translate-x-1/2">
                  <FlyingContent>{props.content}</FlyingContent>
                </div>
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          )}
        </AnimatePresence>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
