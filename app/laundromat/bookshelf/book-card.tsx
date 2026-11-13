"use client";

import { useEffect, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { ReportEntryDialog } from "@/app/laundromat/notebook/report-entry-dialog";
import { cn } from "@/lib/utils";

import { BookCover } from "./book-cover";
import type {
  BookNoteTranslation,
  BookNoteView,
  ShelfBookView,
} from "./bookshelf-actions";
import {
  loadBookNotes,
  reportBookNote,
  setBookLoved,
  translateBookNotes,
} from "./bookshelf-actions";
import {
  BOOKSHELF_ICON_BUTTON_CLASS,
  BOOKSHELF_TEXT_BUTTON_CLASS,
} from "./bookshelf-classes";

type NotesState =
  | { kind: "loading" }
  | { kind: "offline" }
  | { kind: "online"; notes: BookNoteView[] };

type TranslationState =
  | { kind: "original" }
  | { kind: "translating" }
  | { kind: "failed" }
  | { kind: "translated"; translations: BookNoteTranslation[]; shown: boolean };

type BookCardProps = {
  book: ShelfBookView;
  rowLabel: string;
  index: number;
  count: number;
  onStep: (step: 1 | -1) => void;
  onClose: () => void;
  onChanged: () => void;
};

export function BookCard(props: BookCardProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.bookshelf.card;
  const { book } = props;
  const [notes, setNotes] = useState<NotesState>({ kind: "loading" });
  const [translation, setTranslation] = useState<TranslationState>({
    kind: "original",
  });
  const [love, setLove] = useState({
    bookId: book.id,
    loved: book.isLovedByMe,
    count: book.voteCount,
  });
  const [loveError, setLoveError] = useState(false);
  const [reporting, setReporting] = useState<number>();
  const [reportedIds, setReportedIds] = useState<number[]>([]);
  const current =
    love.bookId === book.id
      ? love
      : { bookId: book.id, loved: book.isLovedByMe, count: book.voteCount };

  useEffect(() => {
    let isCancelled = false;
    setNotes({ kind: "loading" });
    setTranslation({ kind: "original" });
    loadBookNotes(book.id)
      .catch(() => ({ kind: "offline" as const }))
      .then((result) => {
        if (!isCancelled) setNotes(result);
      });
    return () => {
      isCancelled = true;
    };
  }, [book.id]);

  async function toggleLove() {
    const loved = !current.loved;
    setLoveError(false);
    setLove({
      bookId: book.id,
      loved,
      count: current.count + (loved ? 1 : -1),
    });
    const result = await setBookLoved({ bookId: book.id, loved }).catch(() => ({
      kind: "offline" as const,
    }));
    if (result.kind === "saved") {
      setLove({ bookId: book.id, loved, count: result.voteCount });
      props.onChanged();
    } else {
      setLove(current);
      setLoveError(true);
    }
  }

  async function translate() {
    if (notes.kind !== "online") return;
    if (translation.kind === "translated") {
      setTranslation({ ...translation, shown: !translation.shown });
      return;
    }
    setTranslation({ kind: "translating" });
    const result = await translateBookNotes({
      noteIds: notes.notes.map((note) => note.id),
      locale: copy.locale,
    }).catch(() => ({ kind: "offline" as const }));
    setTranslation(
      result.kind === "translated"
        ? { kind: "translated", translations: result.translations, shown: true }
        : { kind: "failed" }
    );
  }

  async function confirmReport(reason: string | undefined) {
    const noteId = reporting;
    setReporting(undefined);
    if (noteId === undefined) return;
    const result = await reportBookNote({ noteId, reason }).catch(() => ({
      kind: "offline" as const,
    }));
    if (result.kind === "reported") setReportedIds((ids) => [...ids, noteId]);
  }

  function shownBody(note: BookNoteView) {
    if (translation.kind !== "translated" || !translation.shown)
      return note.body;
    return (
      translation.translations.find((entry) => entry.entryId === note.id)
        ?.body ?? note.body
    );
  }

  const catalogue =
    book.source === "manual" ? undefined : text.catalogues[book.source];
  const meta = [
    book.year,
    book.language &&
      new Intl.DisplayNames([copy.locale], { type: "language" }).of(
        book.language
      ),
  ]
    .filter((part) => part !== undefined && part !== "")
    .join(" · ");
  const translateLabel = (() => {
    switch (translation.kind) {
      case "translating":
        return text.translating;
      case "translated":
        return translation.shown ? text.showOriginal : text.showTranslation;
      case "failed":
      case "original":
        return text.translate;
      default: {
        const unhandled: never = translation;
        return unhandled;
      }
    }
  })();

  return (
    <div className="flex min-h-0 flex-col font-[family-name:var(--lm-font-mono)] text-[12px]">
      <div className="flex items-center gap-x-2 border-b border-[var(--lm-edge)] px-2 pb-2">
        <button
          type="button"
          aria-label={text.previousBook}
          className={BOOKSHELF_ICON_BUTTON_CLASS}
          disabled={props.index <= 1}
          onClick={() => props.onStep(-1)}
        >
          ‹
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-[11px] lowercase opacity-75">
          {text.position({
            row: props.rowLabel,
            index: props.index,
            count: props.count,
          })}
        </span>
        <button
          type="button"
          aria-label={text.nextBook}
          className={BOOKSHELF_ICON_BUTTON_CLASS}
          disabled={props.index >= props.count}
          onClick={() => props.onStep(1)}
        >
          ›
        </button>
        <button
          type="button"
          aria-label={copy.bookshelf.close}
          aria-keyshortcuts="Escape"
          className={BOOKSHELF_ICON_BUTTON_CLASS}
          onClick={props.onClose}
        >
          ×
        </button>
      </div>
      <div className="flex min-h-0 flex-col gap-y-4 overflow-y-auto px-3 pt-4 pb-3">
        <div className="flex gap-x-3.5">
          <BookCover book={book} widthPx={92} />
          <div className="flex min-w-0 flex-col gap-y-1">
            <h2
              dir="auto"
              className="font-[family-name:var(--lm-font-display)] text-[17px] leading-snug [text-wrap:balance] text-[var(--lm-ink-hi)]"
            >
              {book.title}
            </h2>
            {book.subtitle !== undefined && (
              <p
                dir="auto"
                className="font-[family-name:var(--lm-font-display)] text-[13px] opacity-85"
              >
                {book.subtitle}
              </p>
            )}
            <p dir="auto">{book.authors}</p>
            <p className="text-[11px] opacity-70">
              {[meta, book.source === "manual" ? text.addedByHand : undefined]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            aria-pressed={current.loved}
            onClick={toggleLove}
            className={cn(
              "flex cursor-pointer items-center gap-x-1.5 rounded-full border px-3 py-1.5 lowercase outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]",
              current.loved
                ? "border-[var(--lm-accent)] text-[var(--lm-accent)]"
                : "border-[var(--lm-edge)] hover:text-[var(--lm-ink-hi)]"
            )}
          >
            <span aria-hidden>{current.loved ? "♥" : "♡"}</span>
            <span className="tabular-nums">{current.count}</span>
            <span>{current.loved ? text.loved : text.love}</span>
          </button>
          {catalogue !== undefined && book.infoUrl !== undefined && (
            <a
              href={book.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--lm-accent)] lowercase underline underline-offset-2 outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
            >
              {text.findOn({ catalogue })} ↗
            </a>
          )}
        </div>
        {loveError && (
          <p className="text-[11px] text-[var(--lm-danger)]">
            {text.loveFailed}
          </p>
        )}
        <div className="flex items-center justify-between gap-x-2">
          <h3 className="text-[10px] tracking-[0.08em] uppercase opacity-70">
            {text.notesHeading({
              count:
                notes.kind === "online" ? notes.notes.length : book.noteCount,
            })}
          </h3>
          {notes.kind === "online" && notes.notes.length > 0 && (
            <button
              type="button"
              className={BOOKSHELF_TEXT_BUTTON_CLASS}
              disabled={translation.kind === "translating"}
              onClick={translate}
            >
              {translateLabel}
            </button>
          )}
        </div>
        {translation.kind === "failed" && (
          <p className="text-[11px] text-[var(--lm-danger)]">
            {text.translateFailed}
          </p>
        )}
        {notes.kind === "loading" && (
          <p className="opacity-70">{text.loadingNotes}</p>
        )}
        {notes.kind === "offline" && (
          <p className="opacity-70">{text.notesOffline}</p>
        )}
        {notes.kind === "online" && (
          <ul className="flex flex-col gap-y-3">
            {notes.notes.map((note) => (
              <li
                key={note.id}
                className="flex flex-col gap-y-1 border-b border-dashed border-[var(--lm-edge)] pb-3"
              >
                <p
                  dir="auto"
                  className="font-[family-name:var(--lm-font-display)] text-[14px] leading-relaxed text-[var(--lm-ink-hi)]"
                >
                  {shownBody(note)}
                </p>
                <div className="flex items-center justify-between gap-x-2 text-[11px] opacity-75">
                  <span dir="auto">— {note.signOff ?? text.aVisitor}</span>
                  <button
                    type="button"
                    className={BOOKSHELF_TEXT_BUTTON_CLASS}
                    disabled={reportedIds.includes(note.id)}
                    onClick={() => setReporting(note.id)}
                  >
                    {reportedIds.includes(note.id)
                      ? text.reported
                      : text.report}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {reporting !== undefined && (
        <ReportEntryDialog
          text={copy.bookshelf.reportDialog}
          onCancel={() => setReporting(undefined)}
          onConfirm={confirmReport}
        />
      )}
    </div>
  );
}
