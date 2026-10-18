"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type PenMode = "write" | "draw";

type NotebookPhoneBarProps = {
  status: ReactNode;
  pen:
    | {
        mode: PenMode;
        label: string;
        modeLabels: { [mode in PenMode]: string };
        onModeChange: (mode: PenMode) => void;
      }
    | undefined;
  notify: { label: string; disabled: boolean; onPress: () => void } | undefined;
  undo: { label: string; disabled: boolean; onPress: () => void } | undefined;
  save:
    | { label: string; disabled: boolean; busy: boolean; onPress: () => void }
    | undefined;
  close: { label: string; onPress: () => void };
};

const ROUND_BUTTON_CLASS =
  "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--lm-edge)] bg-[var(--lm-panel)] text-[var(--lm-ink-hi)] outline-none transition-opacity focus-visible:border-[var(--lm-accent)] disabled:cursor-default disabled:opacity-40";

function LineIcon(props: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={props.d} />
    </svg>
  );
}

/** Draw the notebook's status and controls as a thumb-sized bar along the bottom of the screen, outside the scaled book. */
export function NotebookPhoneBar(props: NotebookPhoneBarProps) {
  const [root, setRoot] = useState<Element>();

  useEffect(() => {
    setRoot(document.querySelector("[data-laundromat-root]") ?? document.body);
  }, []);

  if (root === undefined) return null;

  return createPortal(
    <div
      data-notebook
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-y-3 bg-gradient-to-t from-[var(--lm-bg)] via-[var(--lm-bg)]/90 to-transparent px-4 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] font-[family-name:var(--lm-font-mono)]"
    >
      <p
        role="status"
        className="line-clamp-2 text-center text-[12px] text-[var(--lm-ink)] lowercase"
      >
        {props.status}
      </p>
      <div className="pointer-events-auto flex items-center justify-between gap-x-3">
        <button
          type="button"
          aria-label={props.close.label}
          onClick={props.close.onPress}
          className={ROUND_BUTTON_CLASS}
        >
          <LineIcon d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
        </button>
        {props.pen !== undefined && (
          <div
            role="group"
            aria-label={props.pen.label}
            className="flex h-12 items-center rounded-full border border-[var(--lm-edge)] bg-[var(--lm-panel)] p-1"
          >
            {(["write", "draw"] satisfies PenMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={props.pen?.mode === mode}
                onClick={() => props.pen?.onModeChange(mode)}
                className={cn(
                  "h-full cursor-pointer rounded-full px-5 text-[13px] lowercase outline-none focus-visible:text-[var(--lm-ink-hi)]",
                  props.pen?.mode === mode
                    ? "bg-[var(--lm-edge)] text-[var(--lm-ink-hi)]"
                    : "text-[var(--lm-ink)]"
                )}
              >
                {props.pen?.modeLabels[mode]}
              </button>
            ))}
          </div>
        )}
        {props.notify !== undefined && (
          <button
            type="button"
            disabled={props.notify.disabled}
            onClick={props.notify.onPress}
            className="h-12 min-w-0 cursor-pointer truncate rounded-full border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-5 text-[13px] text-[var(--lm-ink-hi)] lowercase outline-none focus-visible:border-[var(--lm-accent)] disabled:cursor-default disabled:opacity-60"
          >
            {props.notify.label}
          </button>
        )}
        <div className="flex items-center gap-x-2">
          {props.undo !== undefined && (
            <button
              type="button"
              aria-label={props.undo.label}
              disabled={props.undo.disabled}
              onClick={props.undo.onPress}
              className={ROUND_BUTTON_CLASS}
            >
              <LineIcon d="M7.5 5L4 8.5 7.5 12M4.5 8.5h7a4 4 0 010 8H9" />
            </button>
          )}
          {props.save !== undefined ? (
            <button
              type="button"
              aria-label={props.save.label}
              disabled={props.save.disabled}
              onClick={props.save.onPress}
              className={cn(
                "flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--lm-accent)] text-[var(--lm-bg)] transition-opacity outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-accent)] disabled:cursor-default disabled:opacity-35",
                props.save.busy && "animate-pulse"
              )}
            >
              <LineIcon d="M4.5 10.5l3.5 3.5 7.5-8" />
            </button>
          ) : (
            <span aria-hidden className="size-14" />
          )}
        </div>
      </div>
    </div>,
    root
  );
}
