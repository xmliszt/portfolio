"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "@/app/laundromat/toolbar-button-class";
import { ToolbarLabel } from "@/app/laundromat/toolbar-label";
import { readSettingsTicketHash } from "@/lib/laundromat/settings-ticket/read-settings-ticket-hash";

import { SettingsDialog } from "./settings-dialog";

const DIALOG_EASE = [0.23, 1, 0.32, 1] as const;

/** Open the laundromat's settings dialog from a gear in the toolbar, returning focus to the gear when it closes, or on its own with the ticket from a `#ticket=` link to restore, removing the link's ticket from the address once it is read. */
export function SettingsButton() {
  const { copy } = useLaundromatCopy();
  const [isOpen, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [restoreCode, setRestoreCode] = useState<string>();

  useEffect(() => {
    function openFromTicketLink() {
      const code = readSettingsTicketHash(window.location.hash);
      if (code === undefined) return;
      setRestoreCode(code);
      setOpen(true);
    }
    openFromTicketLink();
    window.addEventListener("hashchange", openFromTicketLink);
    return () => window.removeEventListener("hashchange", openFromTicketLink);
  }, []);

  function clearTicketLink() {
    setRestoreCode(undefined);
    if (readSettingsTicketHash(window.location.hash) === undefined) return;
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );
  }

  function close() {
    setOpen(false);
    setRestoreCode(undefined);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function handleBackdropPointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
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
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="6" cy="6" r="3.25" />
          <path d="M6 1v1.75M6 9.25V11M1 6h1.75M9.25 6H11M2.46 2.46l1.24 1.24M8.3 8.3l1.24 1.24M2.46 9.54l1.24-1.24M8.3 3.7l1.24-1.24" />
        </svg>
        <ToolbarLabel open={isOpen}>{copy.toolbar.settings}</ToolbarLabel>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--lm-backdrop)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: DIALOG_EASE }}
            onPointerDown={handleBackdropPointerDown}
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 6 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 6 }
              }
              transition={{ duration: 0.24, ease: DIALOG_EASE }}
            >
              <SettingsDialog
                restoreCode={restoreCode}
                onRestoreRead={clearTicketLink}
                onClose={close}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
