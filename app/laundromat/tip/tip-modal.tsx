"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { TIP_PANEL_CLASS } from "./tip-classes";

const DIALOG_EASE = [0.23, 1, 0.32, 1] as const;

type TipModalProps = {
  open: boolean;
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Show `children` in a centred panel over a dimmed backdrop that closes on Escape or a press outside the panel. */
export function TipModal(props: TipModalProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);
  const { open, onClose } = props;

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>("button")
      ?.focus({ preventScroll: true });
  }, [open]);

  const offset = prefersReducedMotion ? {} : { scale: 0.97, y: 6 };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--lm-backdrop)] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: DIALOG_EASE }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal
            aria-labelledby={props.labelledBy}
            className={cn(
              TIP_PANEL_CLASS,
              "max-h-[calc(100dvh-32px)] w-[min(372px,calc(100vw-32px))] rounded-[22px]"
            )}
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, ...offset }}
            transition={{ duration: 0.24, ease: DIALOG_EASE }}
          >
            {props.children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
