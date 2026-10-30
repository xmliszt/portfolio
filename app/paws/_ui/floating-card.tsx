import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { PENDING_COPY } from "./pending-copy";
import { SCROLL_FADE_CLASS } from "./scroll-fade-class";

const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .17 0 0 0 0 .23 0 0 0 0 .39 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

type FloatingCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

/** Render a small paper card in the bottom-left corner of the page, titled and closable, with its body scrolling between header and footer. */
export function FloatingCard(props: FloatingCardProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (card && !card.contains(document.activeElement)) card.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") props.onClose();
  }

  return (
    <section
      ref={cardRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      style={{ backgroundImage: PAPER_GRAIN }}
      className={cn(
        "pointer-events-auto absolute bottom-4 left-4 z-10 flex max-h-[calc(100dvh-2rem)] w-[320px] max-w-[calc(100vw-2rem)] flex-col outline-none",
        "border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[12px] leading-snug text-[var(--pw-ink)]",
        "sm:bottom-6 sm:left-6"
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-x-3 py-2 pr-1.5 pl-3">
        <h2
          id={titleId}
          className="pt-1.5 font-[family-name:var(--pw-font-display)] text-[22px] leading-none"
        >
          {props.title}
        </h2>
        <button
          type="button"
          aria-label={PENDING_COPY.close}
          onClick={props.onClose}
          className={cn(
            FOCUS_RING_CLASS,
            "grid size-7 shrink-0 cursor-pointer place-items-center text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)]"
          )}
        >
          <svg
            aria-hidden
            viewBox="0 0 12 12"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </header>
      <div
        className={cn(
          "flex min-h-0 flex-col gap-y-3 overflow-y-auto px-3 py-3",
          SCROLL_FADE_CLASS
        )}
      >
        {props.children}
      </div>
      {props.footer && (
        <footer className="flex shrink-0 items-center justify-between gap-x-3 border-t-[1.5px] border-[var(--pw-rule)] p-3">
          {props.footer}
        </footer>
      )}
    </section>
  );
}
