"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type CcSelectOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  /** Text matched by type-ahead; defaults to `label` when it is a string. */
  text?: string;
};

type CcSelectProps<T extends string> = {
  id?: string;
  "aria-label"?: string;
  value: T;
  options: readonly CcSelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function CcSelect<T extends string>(props: CcSelectProps<T>) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = props.options.findIndex(
    (option) => option.value === props.value
  );
  const selected = props.options.find((option) => option.value === props.value);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  function open() {
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  }

  function choose(index: number) {
    const option = props.options.at(index);
    if (option !== undefined && option.value !== props.value) {
      props.onChange(option.value);
    }
    setIsOpen(false);
  }

  function findByLetter(key: string) {
    const letter = key.toLowerCase();
    const start = isOpen ? activeIndex + 1 : selectedIndex + 1;
    const ordered = [
      ...props.options.slice(start),
      ...props.options.slice(0, start),
    ];
    const match = ordered.find((option) => {
      const text =
        option.text ?? (typeof option.label === "string" ? option.label : "");
      return text.toLowerCase().startsWith(letter);
    });
    return match === undefined ? -1 : props.options.indexOf(match);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const lastIndex = props.options.length - 1;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!isOpen) {
          open();
          return;
        }
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex(Math.min(Math.max(activeIndex + step, 0), lastIndex));
        return;
      }
      case "Home":
      case "End":
        if (!isOpen) return;
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? 0 : lastIndex);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen) choose(activeIndex);
        else open();
        return;
      case "Escape":
        if (!isOpen) return;
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
        return;
      case "Tab":
        setIsOpen(false);
        return;
      default: {
        if (event.key.length !== 1 || event.metaKey || event.ctrlKey) return;
        const index = findByLetter(event.key);
        if (index === -1) return;
        if (isOpen) setActiveIndex(index);
        else choose(index);
      }
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", props.className)}>
      <button
        id={props.id}
        type="button"
        role="combobox"
        aria-label={props["aria-label"]}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        disabled={props.disabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleKeyDown}
        style={props.style}
        className={cn(
          "cc-input flex items-center justify-between gap-x-2 text-left disabled:opacity-50",
          isOpen && "border-primary"
        )}
      >
        <span
          className={cn(
            "truncate",
            selected === undefined && "text-muted-foreground"
          )}
        >
          {selected?.label ?? props.placeholder ?? ""}
        </span>
        <span aria-hidden className="text-muted-foreground text-[9px]">
          ▾
        </span>
      </button>
      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="bg-popover absolute top-[calc(100%+2px)] left-0 z-40 flex max-h-64 max-w-[calc(100vw-24px)] min-w-full flex-col overflow-y-auto border py-1 shadow-[0_8px_24px_hsl(var(--cc-shadow))]"
        >
          {props.options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={option.value === props.value}
              onPointerMove={() => setActiveIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
              className={cn(
                "flex h-7 shrink-0 items-center gap-x-2 px-2 text-[12px] whitespace-nowrap",
                index === activeIndex && "bg-cc-panel-2 text-foreground",
                option.value === props.value ? "text-primary" : "text-cc-text-2"
              )}
            >
              <span aria-hidden className="w-2.5 text-[10px]">
                {option.value === props.value ? "✓" : ""}
              </span>
              <span className="truncate">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
