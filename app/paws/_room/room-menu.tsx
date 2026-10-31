"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * ROOM MENU STORYBOARD
 *
 *    0ms   the bars fold into a cross
 *    0ms   the column of options drops in under the button
 *   30ms   each option follows the one above it
 * ───────────────────────────────────────────────────────── */

const STAGGER_S = 0.03;
const DROP_SPRING = { type: "spring", stiffness: 520, damping: 34 } as const;
const BAR_CLASS =
  "absolute left-1/2 h-[1.5px] w-4 -translate-x-1/2 bg-current transition-transform duration-200 ease-out motion-reduce:transition-none";

type RoomMenuProps = {
  children: (menu: { close: () => void }) => React.ReactNode;
};

/** Render a square menu button that opens the rows `children` returns as a full-width column under it, closing on Escape, a tap outside or the `close` it hands the rows. */
export function RoomMenu(props: RoomMenuProps) {
  const { copy } = usePawsCopy();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const items = Children.toArray(props.children({ close: handleClose }));

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

  function handleClose() {
    setIsOpen(false);
  }

  function handleToggle() {
    setIsOpen((open) => !open);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Escape" || !isOpen) return;
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={copy.room.menu}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
        className={cn(
          FOCUS_RING_CLASS,
          "relative size-10 shrink-0 cursor-pointer border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:size-8",
          isOpen && "bg-[var(--pw-paper-deep)]"
        )}
      >
        <span
          aria-hidden
          className={cn(
            BAR_CLASS,
            "top-[13px] sm:top-[10px]",
            isOpen && "top-1/2 rotate-45 sm:top-1/2"
          )}
        />
        <span
          aria-hidden
          className={cn(
            BAR_CLASS,
            "top-1/2 -translate-y-1/2",
            isOpen && "scale-x-0"
          )}
        />
        <span
          aria-hidden
          className={cn(
            BAR_CLASS,
            "bottom-[13px] sm:bottom-[10px]",
            isOpen && "top-1/2 bottom-auto -rotate-45 sm:top-1/2 sm:bottom-auto"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            initial="hidden"
            animate="shown"
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            variants={{
              hidden: {},
              shown: { transition: { staggerChildren: STAGGER_S } },
            }}
            className="absolute top-full right-0 z-20 mt-2 flex w-56 flex-col gap-y-2 [&>*]:w-full [&>*>*]:w-full [&>*>*]:justify-between [&>*>div>button]:w-full [&>*>div>button]:justify-between"
          >
            {items.map((item, index) => (
              <motion.div
                key={isValidElement(item) ? item.key : index}
                variants={{
                  hidden: isReduced ? { opacity: 0 } : { opacity: 0, y: -6 },
                  shown: { opacity: 1, y: 0, transition: DROP_SPRING },
                }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
