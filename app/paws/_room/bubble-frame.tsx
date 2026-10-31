"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const POP = { type: "spring", stiffness: 520, damping: 22, mass: 0.7 } as const;
/** The tail points down, shifted along the bottom by its anchor's `--pw-tail-x`, or out of the left or right side when the anchor's `data-tail` says the cat is off that edge. */
const TAIL_CLASS = [
  "after:absolute after:top-full after:left-[calc(50%+var(--pw-tail-x,0px))] after:-ml-[5px] after:border-x-[5px] after:border-t-[6px] after:border-x-transparent after:border-t-[var(--pw-ink)]",
  "group-data-[tail=left]/anchor:after:top-1/2 group-data-[tail=left]/anchor:after:right-full group-data-[tail=left]/anchor:after:left-auto group-data-[tail=left]/anchor:after:-mt-[5px] group-data-[tail=left]/anchor:after:ml-0 group-data-[tail=left]/anchor:after:border-x-0 group-data-[tail=left]/anchor:after:border-t-0 group-data-[tail=left]/anchor:after:border-y-[5px] group-data-[tail=left]/anchor:after:border-r-[6px] group-data-[tail=left]/anchor:after:border-y-transparent group-data-[tail=left]/anchor:after:border-r-[var(--pw-ink)]",
  "group-data-[tail=right]/anchor:after:top-1/2 group-data-[tail=right]/anchor:after:left-full group-data-[tail=right]/anchor:after:-mt-[5px] group-data-[tail=right]/anchor:after:ml-0 group-data-[tail=right]/anchor:after:border-x-0 group-data-[tail=right]/anchor:after:border-t-0 group-data-[tail=right]/anchor:after:border-y-[5px] group-data-[tail=right]/anchor:after:border-l-[6px] group-data-[tail=right]/anchor:after:border-y-transparent group-data-[tail=right]/anchor:after:border-l-[var(--pw-ink)]",
];

type BubbleFrameProps = {
  accent: string;
  className?: string;
  children: React.ReactNode;
};

/** Render a paper speech bubble with an ink border, a tail toward its cat (see `TAIL_CLASS`) and a second outline in `accent` printed slightly off, springing up when it appears. */
export function BubbleFrame(props: BubbleFrameProps) {
  const isReduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={isReduced ? { duration: 0.15 } : POP}
      style={{ transformOrigin: "50% 100%" }}
      className={cn(
        "relative isolate border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[13px] leading-snug text-[var(--pw-ink)]",
        TAIL_CLASS,
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
