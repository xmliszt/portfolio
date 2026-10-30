"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";

import type { CatLook } from "@/lib/paws/cat-look";
import { COPY } from "@/lib/paws/copy";
import { cn } from "@/lib/utils";

import { CatPlayground } from "./cat-playground";
import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { SCROLL_FADE_CLASS } from "./scroll-fade-class";

/* ─────────────────────────────────────────────────────────
 * STUDIO STORYBOARD
 *
 *    0ms   paper veil fades in over the room
 *   60ms   eyebrow and title drop in
 *  120ms   cat rises into the square frame
 *  200ms   dock slides up from the bottom
 *  on change   cat bounces 1 → 1.05 → 1 without restarting the playground
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

/** Render the full-screen studio over the room: the visitor's cat large in a square playground that bounces on every `reactKey` change, and a dock of fixed height with scrolling controls and a footer. */
export function StudioFrame(props: StudioFrameProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const bouncedKeyRef = useRef(props.reactKey);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const isReduced = useReducedMotion() ?? false;

  useEffect(() => {
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    if (bouncedKeyRef.current === props.reactKey) return;
    bouncedKeyRef.current = props.reactKey;
    if (!isReduced)
      void animate(scope.current, { scale: [1, 1.05, 1] }, BOUNCE_TRANSITION);
  }, [props.reactKey, isReduced, animate, scope]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") props.onClose();
    if (event.key !== "Tab") return;
    const focusable = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), [tabindex='0']"
      ),
    ];
    const first = focusable.at(0);
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
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
        aria-label={COPY.common.close}
        onClick={props.onClose}
        className={cn(
          FOCUS_RING_CLASS,
          "absolute top-4 right-4 grid size-10 cursor-pointer place-items-center text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)] sm:top-6 sm:right-6 sm:size-8"
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
        className="flex flex-col items-center gap-y-1.5 px-10 sm:flex-row sm:items-baseline sm:gap-x-4"
      >
        <h2
          id={titleId}
          className="font-[family-name:var(--pw-font-display)] text-[22px] leading-none whitespace-nowrap"
        >
          {props.title}
        </h2>
        <p className="flex items-center gap-x-1.5 text-[11px] tracking-[0.12em] whitespace-nowrap text-[var(--pw-ink-soft)] uppercase before:size-1.5 before:bg-[var(--pw-orange)] before:content-['']">
          {props.eyebrow}
        </p>
      </motion.header>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-4">
        <motion.div
          {...rise(TIMING.cat, 16)}
          className="aspect-square w-[min(78vw,42dvh,420px)] shrink-0"
        >
          <div ref={scope} className="size-full">
            <CatPlayground look={props.look} />
          </div>
        </motion.div>
      </div>

      <motion.div
        {...rise(TIMING.dock, 24)}
        className="flex w-full max-w-[560px] flex-col border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[12px] leading-snug"
      >
        <div className="flex h-[min(34dvh,300px)] min-h-0 flex-col">
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col gap-y-3 overflow-y-auto p-3",
              SCROLL_FADE_CLASS
            )}
          >
            {props.children}
          </div>
        </div>
        <footer className="flex items-center justify-between gap-x-3 border-t-[1.5px] border-[var(--pw-rule)] p-3 [&>:only-child]:ml-auto">
          {props.footer}
        </footer>
      </motion.div>
    </motion.section>
  );
}
