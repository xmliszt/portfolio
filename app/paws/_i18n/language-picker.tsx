"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { getPawsCopy } from "@/lib/paws/i18n/get-paws-copy";
import { PAWS_LOCALES } from "@/lib/paws/i18n/paws-locales";
import { cn } from "@/lib/utils";

import { usePawsCopy } from "./use-paws-copy";

const OPTIONS = PAWS_LOCALES.map((locale) => ({
  locale,
  name: getPawsCopy(locale).languageName,
}));

type LanguagePickerProps = {
  onChange?: () => void;
};

/** Let the visitor switch the Paws language from a riso menu of every language, each named in its own language, with arrow keys, Home, End, typing to jump, Enter to pick and Escape to close. */
export function LanguagePicker(props: LanguagePickerProps) {
  const { copy, setLocale } = usePawsCopy();
  const listId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion() ?? false;
  const selectedIndex = Math.max(
    0,
    OPTIONS.findIndex((option) => option.locale === copy.locale)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.focus();
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

  useEffect(() => {
    if (isOpen)
      document
        .getElementById(`${listId}-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex, listId]);

  function open() {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function pick(index: number) {
    const option = OPTIONS[index];
    if (option !== undefined && option.locale !== copy.locale) {
      setLocale(option.locale);
      props.onChange?.();
    }
    close();
  }

  function handleButtonKeyDown(event: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    const last = OPTIONS.length - 1;
    const moves: { [key: string]: number | undefined } = {
      ArrowDown: Math.min(last, activeIndex + 1),
      ArrowUp: Math.max(0, activeIndex - 1),
      Home: 0,
      End: last,
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      setActiveIndex(move);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(activeIndex);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key.length === 1) {
      const key = event.key.toLowerCase();
      const found = OPTIONS.findIndex(
        (option, index) =>
          index > activeIndex && option.name.toLowerCase().startsWith(key)
      );
      const wrapped =
        found >= 0
          ? found
          : OPTIONS.findIndex((option) =>
              option.name.toLowerCase().startsWith(key)
            );
      if (wrapped >= 0) setActiveIndex(wrapped);
    }
  }

  function handleToggle() {
    if (isOpen) close();
    else open();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`${copy.room.language}: ${OPTIONS[selectedIndex]?.name ?? ""}`}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          FOCUS_RING_CLASS,
          "flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
        )}
      >
        <span className="max-w-28 truncate">
          {OPTIONS[selectedIndex]?.name}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 10 10"
          className={cn(
            "size-2.5 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="currentColor"
        >
          <path d="M1 3l4 4 4-4z" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={copy.room.language}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={handleListKeyDown}
            initial={
              isReduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ transformOrigin: "100% 0%" }}
            className="absolute top-full right-0 z-20 mt-2 max-h-[min(60dvh,360px)] w-48 overflow-y-auto border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] py-1 text-[12px] text-[var(--pw-ink)] shadow-[3px_2px_0_var(--pw-pink)] outline-none [scrollbar-width:thin]"
          >
            {OPTIONS.map((option, index) => (
              <li
                key={option.locale}
                id={`${listId}-${index}`}
                role="option"
                lang={option.locale}
                aria-selected={index === selectedIndex}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => pick(index)}
                className={cn(
                  "flex items-center justify-between gap-x-2 px-3 py-2 sm:py-1.5",
                  index === activeIndex && "bg-[var(--pw-paper-deep)]",
                  index === selectedIndex && "font-medium"
                )}
              >
                <span>{option.name}</span>
                {index === selectedIndex && (
                  <span
                    aria-hidden
                    className="size-2 bg-[var(--pw-yellow)] outline-[1.5px] outline-[var(--pw-ink)] outline-solid"
                  />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
