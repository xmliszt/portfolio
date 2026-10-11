"use client";

import { useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { describeSpread } from "@/lib/laundromat/notebook/describe-spread";
import { getSpreadAtRatio } from "@/lib/laundromat/notebook/get-spread-at-ratio";
import { cn } from "@/lib/utils";

const PAGE_KEY_STEP = 5;

type PageScrubberProps = {
  spread: number;
  spreadCount: number;
  pageCount: number;
  inkedSpreads: number[];
  disabled: boolean;
  onSelect: (spread: number) => void;
};

/** Draw the notebook's page edges as a strip of ticks, one per spread, that jumps to the spread pressed, dragged to, or stepped to with the keyboard. */
export function PageScrubber(props: PageScrubberProps) {
  const { copy } = useLaundromatCopy();
  const [preview, setPreview] = useState<number>();
  const [isDragging, setIsDragging] = useState(false);
  const shown = preview ?? props.spread;

  function getSpreadAt(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return getSpreadAtRatio({
      ratio: (event.clientX - rect.left) / rect.width,
      spreadCount: props.spreadCount,
    });
  }

  function select(spread: number) {
    if (props.disabled || spread === props.spread) return;
    props.onSelect(spread);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (props.disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    setPreview(getSpreadAt(event));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (props.disabled) return;
    setPreview(getSpreadAt(event));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    setIsDragging(false);
    select(getSpreadAt(event));
    if (event.pointerType !== "mouse") setPreview(undefined);
  }

  function handlePointerCancel() {
    setIsDragging(false);
    setPreview(undefined);
  }

  function handlePointerLeave() {
    if (!isDragging) setPreview(undefined);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const last = props.spreadCount - 1;
    const target = (() => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
          return props.spread - 1;
        case "ArrowRight":
        case "ArrowUp":
          return props.spread + 1;
        case "PageDown":
          return props.spread - PAGE_KEY_STEP;
        case "PageUp":
          return props.spread + PAGE_KEY_STEP;
        case "Home":
          return 0;
        case "End":
          return last;
        default:
          return undefined;
      }
    })();
    if (target === undefined) return;
    event.preventDefault();
    select(Math.min(last, Math.max(0, target)));
  }

  const label = describeSpread({
    spread: shown,
    pageCount: props.pageCount,
    copy,
  });

  return (
    <div
      role="slider"
      tabIndex={props.disabled ? -1 : 0}
      aria-label={copy.notebook.scrubberLabel}
      aria-valuemin={0}
      aria-valuemax={props.spreadCount - 1}
      aria-valuenow={props.spread}
      aria-valuetext={describeSpread({
        spread: props.spread,
        pageCount: props.pageCount,
        copy,
      })}
      aria-disabled={props.disabled}
      className="group relative flex h-9 w-full cursor-pointer touch-none items-start outline-offset-4 outline-none focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed aria-disabled:cursor-default"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
    >
      {Array.from({ length: props.spreadCount }, (_, spread) => {
        const isCurrent = spread === props.spread;
        const isPreview = spread === preview;
        const isInked = props.inkedSpreads.includes(spread);
        return (
          <span
            key={spread}
            aria-hidden
            className="pointer-events-none flex h-4 flex-1 items-start justify-center"
          >
            <span
              className={cn(
                "w-px rounded-full transition-[height,background-color] duration-150 ease-out",
                isInked ? "bg-[var(--lm-ink)]" : "bg-[var(--lm-edge)]",
                isInked ? "h-2" : "h-1.5",
                isPreview && "h-3.5 bg-[var(--lm-ink-hi)]",
                isCurrent && "h-4 w-0.5 bg-[var(--lm-accent-hi)]"
              )}
            />
          </span>
        );
      })}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 -translate-x-1/2 text-[11px] whitespace-nowrap text-[var(--lm-ink-hi)] lowercase tabular-nums transition-opacity duration-150",
          preview === undefined
            ? "opacity-0 group-focus-visible:opacity-100"
            : "opacity-100"
        )}
        style={{ left: `${((shown + 0.5) / props.spreadCount) * 100}%` }}
      >
        {label}
      </span>
    </div>
  );
}
