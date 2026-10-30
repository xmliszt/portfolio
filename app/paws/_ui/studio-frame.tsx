"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { CatLook } from "@/lib/paws/cat-look";
import { cn } from "@/lib/utils";

import { CatPlayground } from "./cat-playground";
import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { PENDING_COPY } from "./pending-copy";
import { SCROLL_FADE_CLASS } from "./scroll-fade-class";

/* ─────────────────────────────────────────────────────────
 * STUDIO STORYBOARD
 *
 *    0ms   paper veil fades in over the room
 *   60ms   eyebrow and title drop in
 *  120ms   cat rises into the square frame
 *  200ms   dock slides up from the bottom
 *  on change   cat bounces 1 → 1.05 → 1
 * ───────────────────────────────────────────────────────── */

const TIMING = { title: 0.06, cat: 0.12, dock: 0.2 };
const ENTER_SPRING = {
  type: "spring",
  visualDuration: 0.45,
  bounce: 0.18,
} as const;
const BOUNCE_TRANSITION = { duration: 0.32, ease: "easeOut" } as const;

type StudioFrameProps = {
  eyebrow: string;
  title: string;
  look: CatLook;
  reactKey: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

/** Render the full-screen studio over the room: the visitor's cat large in a square playground that bounces on every `reactKey` change, and a dock of controls at the bottom. */
export function StudioFrame(props: StudioFrameProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const isReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") props.onClose();
  }

  function rise(delay: number, offsetY: number) {
    return isReduced
      ? {}
      : {
          initial: { opacity: 0, y: offsetY },
          animate: { opacity: 1, y: 0 },
          transition: { ...ENTER_SPRING, delay },
        };
  }

  return (
    <motion.section
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col items-center bg-[var(--pw-paper)]/85 px-[max(16px,env(safe-area-inset-left))] pt-[max(20px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] text-[var(--pw-ink)] outline-none"
    >
      <button
        type="button"
        aria-label={PENDING_COPY.close}
        onClick={props.onClose}
        className={cn(
          FOCUS_RING_CLASS,
          "absolute top-4 right-4 grid size-8 cursor-pointer place-items-center text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)] sm:top-6 sm:right-6"
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>

      <motion.header
        {...rise(TIMING.title, -6)}
        className="flex items-baseline gap-x-3 pr-10"
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--pw-font-display)] text-[22px] leading-none"
        >
          {props.title}
        </h2>
        <p className="text-[11px] tracking-[0.12em] text-[var(--pw-orange)] uppercase">
          {props.eyebrow}
        </p>
      </motion.header>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-4">
        <motion.div
          {...rise(TIMING.cat, 16)}
          className="aspect-square h-full max-h-[min(46vh,420px)] max-w-[78vw]"
        >
          <motion.div
            key={props.reactKey}
            animate={isReduced ? {} : { scale: [1, 1.05, 1] }}
            transition={BOUNCE_TRANSITION}
            className="size-full"
          >
            <CatPlayground look={props.look} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        {...rise(TIMING.dock, 24)}
        className="flex w-full max-w-[560px] flex-col border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[12px] leading-snug"
      >
        <div
          className={cn(
            "flex max-h-[34dvh] min-w-0 flex-col gap-y-3 overflow-y-auto p-3",
            SCROLL_FADE_CLASS
          )}
        >
          {props.children}
        </div>
        <footer className="flex items-center justify-between gap-x-3 border-t-[1.5px] border-[var(--pw-rule)] p-3">
          {props.footer}
        </footer>
      </motion.div>
    </motion.section>
  );
}
