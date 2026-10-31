"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "@/app/laundromat/toolbar-button-class";
import { ToolbarLabel } from "@/app/laundromat/toolbar-label";

import { OtherAppsDialog } from "./other-apps-dialog";

const DIALOG_MOTION = {
  ease: [0.23, 1, 0.32, 1] satisfies [number, number, number, number],
  backdropSeconds: 0.2,
  panelSeconds: 0.24,
  scale: 0.97,
  offsetPx: 6,
};

/** Render a toolbar button that opens the panel of the maker's other apps over a backdrop. */
export function OtherAppsButton() {
  const { copy } = useLaundromatCopy();
  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  function close() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function handleBackdropPointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (event.target === event.currentTarget) close();
  }

  const hidden = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: DIALOG_MOTION.scale, y: DIALOG_MOTION.offsetPx };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={copy.otherApps.heading}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={TOOLBAR_BUTTON_CLASS}
        onClick={() => setOpen(true)}
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 shrink-0 fill-none stroke-current"
          strokeWidth={1}
        >
          <rect x="1.5" y="1.5" width="3.5" height="3.5" rx="1" />
          <rect x="7" y="1.5" width="3.5" height="3.5" rx="1" />
          <rect x="1.5" y="7" width="3.5" height="3.5" rx="1" />
          <rect x="7" y="7" width="3.5" height="3.5" rx="1" />
        </svg>
        <ToolbarLabel open={isOpen}>{copy.otherApps.heading}</ToolbarLabel>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--lm-backdrop)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: DIALOG_MOTION.backdropSeconds,
              ease: DIALOG_MOTION.ease,
            }}
            onPointerDown={handleBackdropPointerDown}
          >
            <motion.div
              initial={hidden}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={hidden}
              transition={{
                duration: DIALOG_MOTION.panelSeconds,
                ease: DIALOG_MOTION.ease,
              }}
            >
              <OtherAppsDialog onClose={close} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
