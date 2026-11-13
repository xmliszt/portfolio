"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { BookshelfRowKey } from "@/lib/laundromat/bookshelf/bookshelf-row";

import { BookCard } from "./book-card";
import type { BookshelfResult, ShelfBookView } from "./bookshelf-actions";
import { BOOKSHELF_PRIMARY_BUTTON_CLASS } from "./bookshelf-classes";
import { BookshelfPanel } from "./bookshelf-panel";
import { RecommendBookForm } from "./recommend-book-form";

export type BookshelfPanelState =
  | { kind: "book"; row: BookshelfRowKey; bookId: number; notice?: string }
  | { kind: "recommend" };

type BookshelfOverlayProps = {
  panel: BookshelfPanelState | undefined;
  booksByRow: { [key in BookshelfRowKey]: ShelfBookView[] };
  narrow: boolean;
  reducedMotion: boolean;
  onPanelChange: (panel: BookshelfPanelState | undefined) => void;
  onUnsavedChange: (unsaved: boolean) => void;
  refresh: () => Promise<BookshelfResult>;
};

export function BookshelfOverlay(props: BookshelfOverlayProps) {
  const { copy } = useLaundromatCopy();
  const isEmpty = props.booksByRow.loved.length === 0;
  const [shelfNotice, setShelfNotice] = useState<string>();
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const card = (() => {
    if (props.panel?.kind !== "book") return undefined;
    const { row, bookId } = props.panel;
    const books = props.booksByRow[row];
    const index = books.findIndex((book) => book.id === bookId);
    if (index === -1) return undefined;
    return {
      row,
      books,
      index,
      book: books[index],
      notice: props.panel.notice,
    };
  })();
  const isMissingBook = props.panel?.kind === "book" && card === undefined;
  const { onPanelChange } = props;

  useEffect(() => {
    if (isMissingBook) onPanelChange(undefined);
  }, [isMissingBook, onPanelChange]);

  function close() {
    props.onUnsavedChange(false);
    props.onPanelChange(undefined);
  }

  async function handlePlaced(placed: {
    bookId: number;
    title: string;
    isNewBook: boolean;
  }) {
    const result = await props.refresh();
    if (!isMountedRef.current) return;
    props.onUnsavedChange(false);
    const preferred: BookshelfRowKey[] = placed.isNewBook
      ? ["fresh", "loved"]
      : ["loved", "fresh"];
    const row =
      result.kind === "online"
        ? preferred.find((key) =>
            (key === "loved" ? result.mostLoved : result.newest).some(
              (book) => book.id === placed.bookId
            )
          )
        : undefined;
    const notice = placed.isNewBook
      ? copy.bookshelf.form.placed({ title: placed.title })
      : copy.bookshelf.form.merged({ title: placed.title });
    if (row === undefined) {
      setShelfNotice(notice);
      props.onPanelChange(undefined);
      return;
    }
    props.onPanelChange({ kind: "book", row, bookId: placed.bookId, notice });
  }

  return (
    <>
      {props.panel === undefined && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-y-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {shelfNotice !== undefined && (
            <p
              role="status"
              className="rounded-md bg-[var(--lm-panel)] px-2.5 py-1.5 font-[family-name:var(--lm-font-mono)] text-[11px] text-[var(--lm-ink-hi)] [box-shadow:var(--lm-panel-shadow)]"
            >
              {shelfNotice}
            </p>
          )}
          <button
            type="button"
            data-bookshelf-overlay
            className={`${BOOKSHELF_PRIMARY_BUTTON_CLASS} pointer-events-auto font-[family-name:var(--lm-font-mono)] [box-shadow:var(--lm-panel-shadow)]`}
            onClick={() => {
              setShelfNotice(undefined);
              props.onPanelChange({ kind: "recommend" });
            }}
          >
            {isEmpty ? copy.bookshelf.recommendFirst : copy.bookshelf.recommend}
          </button>
        </div>
      )}
      <AnimatePresence>
        {props.panel?.kind === "recommend" && (
          <BookshelfPanel
            key="recommend"
            narrow={props.narrow}
            reducedMotion={props.reducedMotion}
            label={copy.bookshelf.form.dialogLabel}
            focusCloseOnOpen={false}
            onClose={close}
          >
            <RecommendBookForm
              onClose={close}
              onPlaced={handlePlaced}
              onUnsavedChange={props.onUnsavedChange}
            />
          </BookshelfPanel>
        )}
        {card !== undefined && (
          <BookshelfPanel
            key="book"
            narrow={props.narrow}
            reducedMotion={props.reducedMotion}
            label={copy.bookshelf.card.dialogLabel({ title: card.book.title })}
            focusCloseOnOpen
            onClose={close}
          >
            {card.notice !== undefined && (
              <p
                role="status"
                className="mx-2 mb-2 rounded-md bg-[var(--lm-bg)] px-2.5 py-1.5 font-[family-name:var(--lm-font-mono)] text-[11px] text-[var(--lm-ink-hi)]"
              >
                {card.notice}
              </p>
            )}
            <BookCard
              book={card.book}
              rowLabel={copy.bookshelf.rows[card.row]}
              index={card.index + 1}
              count={card.books.length}
              onStep={(step) => {
                const next = card.books.at(card.index + step);
                if (next !== undefined && card.index + step >= 0) {
                  props.onPanelChange({
                    kind: "book",
                    row: card.row,
                    bookId: next.id,
                  });
                }
              }}
              onClose={close}
              onChanged={() => void props.refresh()}
            />
          </BookshelfPanel>
        )}
      </AnimatePresence>
    </>
  );
}
