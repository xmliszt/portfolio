"use client";

import { useEffect, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { ReportEntryDialog } from "@/app/laundromat/notebook/report-entry-dialog";
import { MAX_TRANSLATED_ENTRIES } from "@/lib/laundromat/notebook/max-translated-entries";

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
import { LoveButton } from "./love-button";

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
      <BookCardDetails
        key={`${props.book.id}:${copy.locale}`}
        book={props.book}
        onChanged={props.onChanged}
      />
    </div>
  );
}

type BookCardDetailsProps = {
  book: ShelfBookView;
  onChanged: () => void;
};

function BookCardDetails(props: BookCardDetailsProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.bookshelf.card;
  const [notes, setNotes] = useState<NotesState>({ kind: "loading" });
  const [translation, setTranslation] = useState<TranslationState>({
    kind: "original",
  });
  const [love, setLove] = useState({
    loved: props.book.isLovedByMe,
    count: props.book.voteCount,
  });
  const [isLoveFailed, setIsLoveFailed] = useState(false);
  const [reporting, setReporting] = useState<number>();
  const [reportedIds, setReportedIds] = useState<number[]>([]);
  const bookId = props.book.id;

  useEffect(() => {
    let isCancelled = false;
    loadBookNotes(bookId)
      .catch(() => ({ kind: "offline" as const }))
      .then((result) => {
        if (!isCancelled) setNotes(result);
      });
    return () => {
      isCancelled = true;
    };
  }, [bookId]);

  async function toggleLove() {
    const previous = love;
    const loved = !previous.loved;
    setIsLoveFailed(false);
    setLove({ loved, count: previous.count + (loved ? 1 : -1) });
    const result = await setBookLoved({ bookId, loved }).catch(() => ({
      kind: "offline" as const,
    }));
    if (result.kind === "saved") {
      setLove({ loved, count: result.voteCount });
      props.onChanged();
      return;
    }
    setLove(previous);
    setIsLoveFailed(true);
  }

  async function translate() {
    if (notes.kind !== "online") return;
    if (translation.kind === "translated") {
      setTranslation({ ...translation, shown: !translation.shown });
      return;
    }
    setTranslation({ kind: "translating" });
    const result = await translateBookNotes({
      noteIds: notes.notes
        .slice(0, MAX_TRANSLATED_ENTRIES)
        .map((note) => note.id),
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
    props.book.source === "manual"
      ? undefined
      : text.catalogues[props.book.source];
  const languageName =
    props.book.language === undefined
      ? undefined
      : new Intl.DisplayNames([copy.locale], { type: "language" }).of(
          props.book.language
        );
  const meta = [
    props.book.year,
    languageName,
    props.book.source === "manual" ? text.addedByHand : undefined,
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
    <>
      <div className="flex min-h-0 flex-col gap-y-4 overflow-y-auto px-3 pt-4 pb-3">
        <div className="flex gap-x-3.5">
          <BookCover book={props.book} widthPx={92} />
          <div className="flex min-w-0 flex-col gap-y-1">
            <h2
              dir="auto"
              className="font-[family-name:var(--lm-font-display)] text-[17px] leading-snug [text-wrap:balance] text-[var(--lm-ink-hi)]"
            >
              {props.book.title}
            </h2>
            {props.book.subtitle !== undefined && (
              <p
                dir="auto"
                className="font-[family-name:var(--lm-font-display)] text-[13px] opacity-85"
              >
                {props.book.subtitle}
              </p>
            )}
            <p dir="auto">{props.book.authors}</p>
            {meta !== "" && <p className="text-[11px] opacity-70">{meta}</p>}
          </div>
        </div>
        <div className="flex flex-col items-start gap-y-1.5">
          <LoveButton
            loved={love.loved}
            count={love.count}
            label={love.loved ? text.loved : text.love}
            onToggle={toggleLove}
          />
          {catalogue !== undefined && props.book.infoUrl !== undefined && (
            <a
              href={props.book.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={text.findOn({ catalogue })}
              className="rounded-sm text-[11px] text-[var(--lm-ink)] outline-none hover:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
            >
              {catalogue} ↗
            </a>
          )}
        </div>
        {isLoveFailed && (
          <p className="text-[11px] text-[var(--lm-danger)]">
            {text.loveFailed}
          </p>
        )}
        <div className="flex items-center justify-between gap-x-2">
          <h3 className="text-[10px] tracking-[0.08em] uppercase opacity-70">
            {text.notesHeading({
              count:
                notes.kind === "online"
                  ? notes.notes.length
                  : props.book.noteCount,
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
    </>
  );
}
