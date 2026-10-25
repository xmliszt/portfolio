import { useEffect, useRef } from "react";
import { groupBy } from "lodash";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLaundromatUpdate } from "@/app/laundromat/update/use-laundromat-update";
import { getBoardEntries } from "@/lib/laundromat/board/get-board-entries";
import { isNewBoardEntry } from "@/lib/laundromat/board/is-new-board-entry";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { BoardScrollArea } from "./board-scroll-area";

export const BOARD_DIALOG_SIZE_PX = { width: 460, height: 703 };

const META_CLASS =
  "font-[family-name:var(--lm-font-mono)] text-[11px] leading-4 lowercase";

type BoardDialogProps = {
  backlit: boolean;
  details: SceneConfig["details"]["board"];
  onClose: () => void;
};

export function BoardDialog(props: BoardDialogProps) {
  const { copy } = useLaundromatCopy();
  const closeRef = useRef<HTMLButtonElement>(null);
  const update = useLaundromatUpdate();
  const entries =
    update.kind === "ready" ? update.entries : getBoardEntries({ copy });
  const lit =
    props.backlit || (update.kind === "ready" && update.hasNewEntries);
  const refreshEntryId =
    update.kind === "ready"
      ? entries.find((entry) => isNewBoardEntry(entry.id))?.id
      : undefined;
  const days = Object.values(groupBy(entries, (entry) => entry.isoDate));
  const latestDate = entries.at(0)?.date;
  const pageStyle: React.CSSProperties = {
    backgroundColor: lit
      ? `color-mix(in oklab, var(--lm-paper), var(--lm-accent-hi) ${props.details.frontlight * 100}%)`
      : "var(--lm-paper)",
  };

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  function handleReload() {
    window.location.reload();
  }

  return (
    <div
      data-board-dialog
      role="dialog"
      aria-labelledby="board-dialog-heading"
      className="flex flex-col gap-y-3 rounded-[22px] bg-[var(--lm-panel)] p-3.5 [box-shadow:var(--lm-panel-shadow)]"
      style={{ width: BOARD_DIALOG_SIZE_PX.width }}
    >
      <article
        className="flex flex-col gap-y-6 rounded-lg px-8 pt-7 pb-6 text-[var(--lm-ink-pen)] shadow-[0_0_0_1px_rgb(0_0_0/0.35),0_1px_0_1px_rgb(255_255_255/0.03)] transition-[background-color] duration-700"
        style={pageStyle}
      >
        <header className="flex flex-col gap-y-3">
          <div
            className={cn(
              META_CLASS,
              "flex items-center justify-between gap-x-4 opacity-60"
            )}
          >
            <span>{copy.board.eyebrow}</span>
            {latestDate !== undefined && (
              <span className="whitespace-nowrap">
                {copy.board.updated({ date: latestDate })}
              </span>
            )}
          </div>
          <h2
            id="board-dialog-heading"
            className="m-0 font-[family-name:var(--lm-font-display)] text-[34px] leading-[1.1] font-normal text-balance lowercase"
          >
            {copy.board.heading}
          </h2>
          <p className="font-[family-name:var(--lm-font-display)] text-[15px] leading-6 text-pretty opacity-70">
            {copy.board.subtitle}
          </p>
        </header>
        <div className="h-[1.5px] bg-[var(--lm-ink-pen)]" />
        <BoardScrollArea className="max-h-[372px]">
          <ol className="flex flex-col gap-y-5 pt-4 pb-6">
            {days.map((dayEntries, index) => (
              <li
                key={dayEntries[0].isoDate}
                className={cn(
                  "grid grid-cols-[64px_1fr] gap-x-4",
                  index > 0 &&
                    "pt-5 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--lm-ink-pen)_15%,transparent)]"
                )}
              >
                <time
                  dateTime={dayEntries[0].isoDate}
                  className={cn(
                    META_CLASS,
                    "sticky top-4 self-start pt-1 opacity-60"
                  )}
                >
                  {dayEntries[0].date}
                </time>
                <ul className="flex flex-col gap-y-5">
                  {dayEntries.map((entry) => {
                    const isNew =
                      update.kind === "ready" && isNewBoardEntry(entry.id);
                    return (
                      <li
                        key={entry.id}
                        data-board-update={entry.id}
                        data-board-update-new={isNew || undefined}
                        className="flex flex-col items-start gap-y-1.5"
                      >
                        <span
                          className={cn(
                            META_CLASS,
                            "flex items-center gap-x-1.5 rounded-full px-2 text-[10px] whitespace-nowrap",
                            isNew
                              ? "shadow-[inset_0_0_0_1px_var(--lm-accent)]"
                              : "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--lm-ink-pen)_35%,transparent)]"
                          )}
                        >
                          {isNew && (
                            <span
                              aria-hidden
                              className="size-1 rounded-full bg-[var(--lm-accent)]"
                            />
                          )}
                          {entry.tag}
                        </span>
                        <h3 className="m-0 font-[family-name:var(--lm-font-display)] text-[18px] leading-6 font-normal text-balance lowercase">
                          {entry.title}
                        </h3>
                        <p className="font-[family-name:var(--lm-font-display)] text-[14.5px] leading-[1.6] text-pretty opacity-75">
                          {entry.body}
                        </p>
                        {entry.id === refreshEntryId && (
                          <button
                            type="button"
                            onClick={handleReload}
                            className={cn(
                              META_CLASS,
                              "mt-1 flex h-6 cursor-pointer items-center gap-x-1.5 rounded-full px-2.5 shadow-[inset_0_0_0_1px_var(--lm-accent)] outline-none hover:bg-[color-mix(in_oklab,var(--lm-accent)_14%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--lm-accent)]"
                            )}
                          >
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-[var(--lm-accent)]"
                            />
                            {copy.toolbar.updateAvailable}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </BoardScrollArea>
        <footer
          className={cn(
            META_CLASS,
            "pt-4 opacity-60 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--lm-ink-pen)_25%,transparent)]"
          )}
        >
          {copy.board.footer}
        </footer>
      </article>
      <div className="flex items-center justify-between gap-x-4 px-2">
        <div className="flex items-center gap-x-2 text-[var(--lm-ink)]">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full transition-colors duration-700",
              lit ? "bg-[var(--lm-accent)]" : "bg-[var(--lm-detail)]"
            )}
          />
          <span className="font-[family-name:var(--lm-font-mono)] text-[11px] lowercase opacity-60">
            {copy.site.name}
          </span>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={props.onClose}
          aria-keyshortcuts="Escape"
          title={copy.board.closeHint}
          className="flex h-8 cursor-pointer items-center gap-x-2 rounded-md px-3 text-[13px] text-[var(--lm-ink)] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
        >
          {copy.board.close}
          <kbd className="rounded px-1 font-[family-name:var(--lm-font-mono)] text-[10px] leading-4 opacity-70 shadow-[inset_0_0_0_1px_var(--lm-edge)]">
            esc
          </kbd>
        </button>
      </div>
    </div>
  );
}
