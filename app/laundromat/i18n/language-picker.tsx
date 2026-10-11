"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { TOOLBAR_BUTTON_CLASS } from "@/app/laundromat/toolbar-button-class";
import { ToolbarLabel } from "@/app/laundromat/toolbar-label";
import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

import { useLaundromatCopy } from "./use-laundromat-copy";

const MENU_COLUMNS = 2;
const MENU_EASE = [0.23, 1, 0.32, 1] as const;

const MENU_KEY_STEPS: { [key: string]: number } = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -MENU_COLUMNS,
  ArrowDown: MENU_COLUMNS,
};

/** Let the visitor switch the laundromat's language from a menu beside the globe, each option named in its own language. */
export function LanguagePicker() {
  const { copy, setLocale } = useLaundromatCopy();
  const [isOpen, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[LAUNDROMAT_LOCALES.indexOf(copy.locale)]?.focus();
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, copy.locale]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleToggle() {
    setOpen(!isOpen);
  }

  function handlePick(locale: LaundromatLocale) {
    setLocale(locale);
    close();
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    const focused = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );
    const lastIndex = LAUNDROMAT_LOCALES.length - 1;
    const target = (() => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return lastIndex;
      const step = MENU_KEY_STEPS[event.key];
      if (step === undefined) return undefined;
      return Math.min(Math.max(focused + step, 0), lastIndex);
    })();
    if (target === undefined) return;
    event.preventDefault();
    optionRefs.current[target]?.focus();
  }

  return (
    <div ref={rootRef} className="relative flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        aria-label={copy.toolbar.language}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={TOOLBAR_BUTTON_CLASS}
        onClick={handleToggle}
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 shrink-0 fill-none stroke-current"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="4.5" />
          <path d="M1.5 6h9M6 1.5c-1.6 1.4-1.6 7.6 0 9M6 1.5c1.6 1.4 1.6 7.6 0 9" />
        </svg>
        <ToolbarLabel open={isOpen}>{copy.languageName}</ToolbarLabel>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            aria-label={copy.toolbar.language}
            className="absolute top-0 right-full mr-1 grid w-max origin-top-right grid-cols-2 gap-x-0.5 rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] p-1 shadow-[0_10px_30px_rgb(0_0_0/0.45)]"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 6, scale: 0.98 }
            }
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 4 }}
            transition={{ duration: 0.18, ease: MENU_EASE }}
            onKeyDown={handleMenuKeyDown}
          >
            {LAUNDROMAT_LOCALES.map((locale, index) => (
              <button
                key={locale}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={locale === copy.locale}
                lang={locale}
                tabIndex={-1}
                className="group/option flex h-7 cursor-pointer items-center gap-x-2 rounded-[4px] bg-transparent pr-3 pl-2 text-left text-[11px] whitespace-nowrap text-[var(--lm-ink)] transition-colors duration-150 outline-none hover:bg-[var(--lm-edge)] hover:text-[var(--lm-ink-hi)] focus-visible:bg-[var(--lm-edge)] focus-visible:text-[var(--lm-ink-hi)] aria-checked:text-[var(--lm-ink-hi)]"
                onClick={() => handlePick(locale)}
              >
                <span
                  aria-hidden
                  className="size-1 shrink-0 rounded-full bg-current opacity-0 group-aria-checked/option:opacity-100"
                />
                {getLaundromatCopy(locale).languageName}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
