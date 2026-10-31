"use client";

import { useContext, useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { ReturnFocusContext } from "@/app/paws/_ui/return-focus-context";
import { SCROLL_FADE_CLASS } from "@/app/paws/_ui/scroll-fade-class";
import { trapTab } from "@/app/paws/_ui/trap-tab";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * SHEET STORYBOARD
 *
 *    0ms   paper veil fades in over the room
 *   60ms   the card rises into the middle
 * ───────────────────────────────────────────────────────── */

const ENTER_SPRING = {
  type: "spring",
  visualDuration: 0.4,
  bounce: 0.15,
} as const;

type RoomSheetProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

/** Render a titled paper card in the middle of the room over a paper veil, its body scrolling, keeping Tab inside it, closing on Escape, the close button or a tap on the veil, and handing focus back to the opener, or to the `ReturnFocusContext` element when the opener is gone, when it unmounts. */
export function RoomSheet(props: RoomSheetProps) {
  const { copy } = usePawsCopy();
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const returnFocusTo = useContext(ReturnFocusContext);

  useEffect(() => {
    const opener = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      const isOpenerShown =
        opener instanceof HTMLElement &&
        opener.isConnected &&
        opener !== document.body;
      (isOpenerShown ? opener : returnFocusTo?.current)?.focus();
    };
  }, [returnFocusTo]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") props.onClose();
    trapTab(event);
  }

  function handleVeilPointerDown(event: React.PointerEvent) {
    if (event.target === event.currentTarget) props.onClose();
  }

  return (
    <motion.section
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onPointerDown={handleVeilPointerDown}
      initial={isReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--pw-paper)]/85 px-[max(16px,env(safe-area-inset-left))] pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] text-[var(--pw-ink)] outline-none"
    >
      <motion.div
        initial={isReduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ENTER_SPRING, delay: 0.06 }}
        className="flex max-h-full w-full max-w-[520px] flex-col border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[12px] leading-snug"
      >
        <header className="flex shrink-0 items-center justify-between gap-x-3 border-b-[1.5px] border-[var(--pw-rule)] py-1 pr-1 pl-4">
          <h2
            id={titleId}
            className="m-0 font-[family-name:var(--pw-font-display)] text-[22px] leading-none"
          >
            {props.title}
          </h2>
          <button
            type="button"
            aria-label={copy.common.close}
            onClick={props.onClose}
            className={cn(
              FOCUS_RING_CLASS,
              "grid size-10 shrink-0 place-items-center text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)] sm:size-8"
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
        </header>
        <div
          tabIndex={0}
          className={cn(
            FOCUS_RING_CLASS,
            "flex min-h-0 flex-col gap-y-8 overflow-y-auto px-4 pt-4 pb-6",
            SCROLL_FADE_CLASS
          )}
        >
          {props.children}
        </div>
      </motion.div>
    </motion.section>
  );
}
