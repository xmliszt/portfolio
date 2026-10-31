"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ClaudeAvatar } from "@/app/laundromat/claude-avatar";
import { ToolbarLabel } from "@/app/laundromat/toolbar-label";
import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";
import { cn } from "@/lib/utils";

const PORTFOLIO_URL = `https://${PORTFOLIO_HOSTNAMES[0]}`;
const BOX_CLASS =
  "group flex h-10 items-center border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8 sm:px-2";

type HeartProps = { filled: boolean };

function Heart(props: HeartProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn(
        "size-3.5 shrink-0 stroke-current transition-colors group-hover:fill-[var(--pw-pink)] group-focus-visible:fill-[var(--pw-pink)]",
        props.filled ? "fill-[var(--pw-pink)]" : "fill-transparent"
      )}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 10C3.5 8.4 1.5 6.7 1.5 4.5 1.5 3.1 2.6 2 3.9 2c.9 0 1.6.5 2.1 1.2C6.5 2.5 7.2 2 8.1 2c1.3 0 2.4 1.1 2.4 2.5 0 2.2-2 3.9-4.5 5.5Z" />
    </svg>
  );
}

/** Link to the maker's portfolio in a new tab: a riso heart that opens to the credit line while hovered or focused, or on a touch screen a heart that opens a card with the credit as the link. */
export function PortfolioLink() {
  const { copy } = usePawsCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const credit = (
    <>
      {copy.room.builtBy.beforeClaude}
      <ClaudeAvatar />
      {copy.room.builtBy.afterClaude}
    </>
  );

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function handleToggle() {
    setIsOpen((open) => !open);
  }

  return (
    <>
      <a
        href={PORTFOLIO_URL}
        target="_blank"
        rel="noopener"
        className={cn(
          FOCUS_RING_CLASS,
          BOX_CLASS,
          "[@media(pointer:coarse)]:hidden"
        )}
      >
        <Heart filled={false} />
        <ToolbarLabel>{credit}</ToolbarLabel>
      </a>
      <div
        ref={rootRef}
        className="relative hidden [@media(pointer:coarse)]:block"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={`${copy.room.builtBy.beforeClaude}Claude${copy.room.builtBy.afterClaude}`}
          onClick={handleToggle}
          className={cn(FOCUS_RING_CLASS, BOX_CLASS, "cursor-pointer")}
        >
          <Heart filled={isOpen} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener"
              initial={
                isReduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 520, damping: 34 }}
              style={{ transformOrigin: "100% 0%" }}
              className={cn(
                FOCUS_RING_CLASS,
                "absolute top-full right-0 z-20 mt-2 flex w-max max-w-[calc(100vw-2rem)] items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 py-2.5 text-[12px] whitespace-nowrap text-[var(--pw-ink)] shadow-[3px_2px_0_var(--pw-pink)]"
              )}
            >
              <span>{credit}</span>
              <svg
                aria-hidden
                viewBox="0 0 10 10"
                className="size-2.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <path d="M3 1.5h5.5V7M8.5 1.5 1.5 8.5" />
              </svg>
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
