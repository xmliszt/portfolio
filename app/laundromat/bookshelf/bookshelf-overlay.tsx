"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { BookshelfRowKey } from "@/lib/laundromat/bookshelf/bookshelf-row";

import { BookCard } from "./book-card";
import type { ShelfBookView } from "./bookshelf-actions";
import { BOOKSHELF_PRIMARY_BUTTON_CLASS } from "./bookshelf-classes";
import { BookshelfPanel } from "./bookshelf-panel";
import { RecommendBookForm } from "./recommend-book-form";

type BookshelfPanelState =
  | { kind: "book"; row: BookshelfRowKey; bookId: number }
  | { kind: "recommend" };

type BookshelfOverlayProps = {
  panel: BookshelfPanelState | undefined;
  booksByRow: { [key in BookshelfRowKey]: ShelfBookView[] };
  narrow: boolean;
  reducedMotion: boolean;
  onPanelChange: (panel: BookshelfPanelState | undefined) => void;
  refresh: () => Promise<void>;
};

export function BookshelfOverlay(props: BookshelfOverlayProps) {
  const { copy } = useLaundromatCopy();
  const [notice, setNotice] = useState<string>();
  const { panel } = props;
  const isEmpty = props.booksByRow.loved.length === 0;

  const card = (() => {
    if (panel?.kind !== "book") return undefined;
    const books = props.booksByRow[panel.row];
    const index = books.findIndex((book) => book.id === panel.bookId);
    if (index === -1) return undefined;
    return { row: panel.row, books, index, book: books[index] };
  })();

  async function handlePlaced(options: {
    bookId: number;
    title: string;
    isNewBook: boolean;
  }) {
    await props.refresh();
    setNotice(
      options.isNewBook
        ? copy.bookshelf.form.placed({ title: options.title })
        : copy.bookshelf.form.merged({ title: options.title })
    );
    props.onPanelChange({
      kind: "book",
      row: options.isNewBook ? "fresh" : "loved",
      bookId: options.bookId,
    });
  }

  return (
    <>
      {panel === undefined && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            data-bookshelf-overlay
            className={`${BOOKSHELF_PRIMARY_BUTTON_CLASS} pointer-events-auto font-[family-name:var(--lm-font-mono)] [box-shadow:var(--lm-panel-shadow)]`}
            onClick={() => {
              setNotice(undefined);
              props.onPanelChange({ kind: "recommend" });
            }}
          >
            {isEmpty ? copy.bookshelf.recommendFirst : copy.bookshelf.recommend}
          </button>
        </div>
      )}
      <AnimatePresence>
        {panel?.kind === "recommend" && (
          <BookshelfPanel
            key="recommend"
            narrow={props.narrow}
            reducedMotion={props.reducedMotion}
            label={copy.bookshelf.form.dialogLabel}
            onClose={() => props.onPanelChange(undefined)}
          >
            <RecommendBookForm
              onClose={() => props.onPanelChange(undefined)}
              onPlaced={handlePlaced}
            />
          </BookshelfPanel>
        )}
        {card !== undefined && (
          <BookshelfPanel
            key="book"
            narrow={props.narrow}
            reducedMotion={props.reducedMotion}
            label={copy.bookshelf.card.dialogLabel({ title: card.book.title })}
            onClose={() => props.onPanelChange(undefined)}
          >
            {notice !== undefined && (
              <p
                role="status"
                className="mx-2 mb-2 rounded-md bg-[var(--lm-bg)] px-2.5 py-1.5 font-[family-name:var(--lm-font-mono)] text-[11px] text-[var(--lm-ink-hi)]"
              >
                {notice}
              </p>
            )}
            <BookCard
              book={card.book}
              rowLabel={copy.bookshelf.rows[card.row]}
              index={card.index + 1}
              count={card.books.length}
              onStep={(step) => {
                const next = card.books.at(card.index + step);
                setNotice(undefined);
                if (next !== undefined && card.index + step >= 0) {
                  props.onPanelChange({
                    kind: "book",
                    row: card.row,
                    bookId: next.id,
                  });
                }
              }}
              onClose={() => props.onPanelChange(undefined)}
              onChanged={() => void props.refresh()}
            />
          </BookshelfPanel>
        )}
      </AnimatePresence>
    </>
  );
}
