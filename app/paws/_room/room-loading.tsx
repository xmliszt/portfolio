"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const HOP = { duration: 0.9, repeat: Infinity, ease: "easeInOut" } as const;
const INKS = ["var(--pw-pink)", "var(--pw-blue)", "var(--pw-orange)"] as const;

type RoomLoadingProps = {
  text: string | undefined;
};

/** Cover the room with a paper veil saying `text` and three hopping ink dots while `text` is set, and fade it away once `text` is cleared. */
export function RoomLoading(props: RoomLoadingProps) {
  const isReduced = useReducedMotion() ?? false;
  return (
    <AnimatePresence>
      {props.text !== undefined && (
        <motion.div
          key="loading"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 grid place-items-center bg-[var(--pw-paper)]/90"
        >
          <div className="flex flex-col items-center gap-y-4 text-[var(--pw-ink)]">
            <span aria-hidden className="flex items-center gap-x-2">
              {INKS.map((ink, index) => (
                <motion.span
                  key={ink}
                  style={{ backgroundColor: ink }}
                  className="size-2.5 rounded-full mix-blend-multiply"
                  animate={
                    isReduced ? { opacity: [0.4, 1, 0.4] } : { y: [0, -6, 0] }
                  }
                  transition={{ ...HOP, delay: index * 0.15 }}
                />
              ))}
            </span>
            <p className="font-[family-name:var(--pw-font-display)] text-[22px] leading-none">
              {props.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
