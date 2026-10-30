"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 520, damping: 22, mass: 0.7 } as const;

type BubbleFrameProps = {
  accent: string;
  className?: string;
  children: React.ReactNode;
};

/** Render a paper speech bubble with an ink border, a tail pointing down and a second outline in `accent` printed slightly off, springing up when it appears. */
export function BubbleFrame(props: BubbleFrameProps) {
  const isReduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={isReduced ? { duration: 0.15 } : POP}
      style={{ transformOrigin: "50% 100%" }}
      className={cn(
        "relative isolate border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[13px] leading-snug text-[var(--pw-ink)] after:absolute after:top-full after:left-1/2 after:-ml-[5px] after:border-x-[5px] after:border-t-[6px] after:border-x-transparent after:border-t-[var(--pw-ink)]",
        props.className
      )}
    >
      <span
        aria-hidden
        style={{ borderColor: props.accent }}
        className="pointer-events-none absolute -inset-[1.5px] -z-10 translate-x-[3px] translate-y-[2px] border-[1.5px] mix-blend-multiply"
      />
      {props.children}
    </motion.div>
  );
}
