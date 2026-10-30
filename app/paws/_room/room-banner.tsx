"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const DROP = { type: "spring", stiffness: 520, damping: 30 } as const;

type RoomBannerProps = {
  text: string | undefined;
};

/** Announce `text` in a small riso card that drops in at the top of the room, and lift it away when `text` is cleared. */
export function RoomBanner(props: RoomBannerProps) {
  const isReduced = useReducedMotion() ?? false;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-16 flex justify-center sm:top-6"
    >
      <AnimatePresence>
        {props.text !== undefined && (
          <motion.p
            key={props.text}
            initial={isReduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={isReduced ? { duration: 0.15 } : DROP}
            className="border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 py-1.5 text-[12px] text-[var(--pw-ink)] shadow-[3px_2px_0_var(--pw-yellow)]"
          >
            {props.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
