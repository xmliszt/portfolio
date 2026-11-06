"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { NotebookTranslationTarget } from "@/app/laundromat/notebook/notebook-translation-context";
import { useNotebookTranslation } from "@/app/laundromat/notebook/use-notebook-translation";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";
import { cn } from "@/lib/utils";

const OPTIONS: NotebookTranslationTarget[] = ["auto", ...LAUNDROMAT_LOCALES];

type NotebookLanguagePickerProps = {
  labelId: string;
};

/** Let the visitor pick the language notebook notes are translated into from a listbox of the laundromat's languages, each named in its own language, below `auto` for the laundromat's current language. */
export function NotebookLanguagePicker(props: NotebookLanguagePickerProps) {
  const { copy } = useLaundromatCopy();
  const { target, setTarget } = useNotebookTranslation();
  const sound = useSoundBoard();
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeOption = OPTIONS[activeIndex];

  useEffect(() => {
    if (isOpen) listRef.current?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  function getLabel(option: NotebookTranslationTarget) {
    return option === "auto"
      ? copy.settings.translateAuto({ language: copy.languageName })
      : getLaundromatCopy(option).languageName;
  }

  function open() {
    setActiveIndex(Math.max(0, OPTIONS.indexOf(target)));
    setOpen(true);
  }

  function pick(option: NotebookTranslationTarget) {
    if (option !== target) sound?.play("knob-click");
    setTarget(option);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const lastIndex = OPTIONS.length - 1;
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activeOption !== undefined) pick(activeOption);
      return;
    }
    const next = (() => {
      if (event.key === "ArrowDown")
        return Math.min(activeIndex + 1, lastIndex);
      if (event.key === "ArrowUp") return Math.max(activeIndex - 1, 0);
      if (event.key === "Home") return 0;
      if (event.key === "End") return lastIndex;
      return undefined;
    })();
    if (next === undefined) return;
    event.preventDefault();
    setActiveIndex(next);
  }

  return (
    <div className="flex flex-col gap-y-1">
      <button
        type="button"
        role="combobox"
        aria-labelledby={props.labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        lang={target === "auto" ? undefined : target}
        onClick={() => (isOpen ? setOpen(false) : open())}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className="flex h-9 w-full cursor-pointer items-center gap-x-2 rounded-full pr-3 pl-3.5 text-left shadow-[inset_0_0_0_1px_var(--lm-edge)] outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--lm-ink)]"
      >
        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-[var(--lm-ink-hi)] lowercase">
          {getLabel(target)}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "size-3 shrink-0 fill-none stroke-[var(--lm-ink)] transition-transform duration-200 motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={props.labelId}
          className="m-0 flex max-h-[min(280px,40dvh)] list-none flex-col gap-y-0.5 overflow-y-auto overscroll-contain rounded-[18px] bg-[var(--lm-panel)] p-1 shadow-[0_0_0_1px_var(--lm-edge),0_10px_30px_rgb(0_0_0/0.45)] [scrollbar-color:var(--lm-line)_transparent] [scrollbar-width:thin]"
        >
          {OPTIONS.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
              lang={option === "auto" ? undefined : option}
              onPointerDown={(event) => event.preventDefault()}
              onPointerMove={() => setActiveIndex(index)}
              onClick={() => pick(option)}
              className="flex h-9 shrink-0 cursor-pointer items-center gap-x-2 rounded-[14px] px-2.5 text-[13px] leading-5 text-[var(--lm-ink)] lowercase aria-selected:bg-[color-mix(in_oklab,var(--lm-ink)_8%,transparent)] aria-selected:text-[var(--lm-ink-hi)]"
            >
              <span className="min-w-0 flex-1 truncate">
                {getLabel(option)}
              </span>
              {option === target && (
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-[var(--lm-accent)]"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
