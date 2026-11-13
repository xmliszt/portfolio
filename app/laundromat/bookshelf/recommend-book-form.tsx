"use client";

import { useEffect, useRef, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { BOOK_TEXT_LIMITS } from "@/lib/laundromat/bookshelf/book-text-limits";
import type { CatalogueBook } from "@/lib/laundromat/bookshelf/catalogue-book";
import type { RecommendBookRejection } from "@/lib/laundromat/supabase/bookshelf-types";

import { BookCover } from "./book-cover";
import type { CatalogueResultView } from "./bookshelf-actions";
import { recommendBook, searchCatalogue } from "./bookshelf-actions";
import {
  BOOKSHELF_ICON_BUTTON_CLASS,
  BOOKSHELF_INPUT_CLASS,
  BOOKSHELF_PRIMARY_BUTTON_CLASS,
  BOOKSHELF_TEXT_BUTTON_CLASS,
} from "./bookshelf-classes";

const SEARCH_DELAY_MS = 350;
const LINK = /(https?:\/\/|www\.)/i;

type Search =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "offline" }
  | { kind: "results"; results: CatalogueResultView[] };

type Chosen =
  | { kind: "catalogue"; result: CatalogueResultView }
  | { kind: "manual"; title: string; subtitle: string; authors: string };

type Step =
  | { kind: "find" }
  | { kind: "manual" }
  | { kind: "note"; chosen: Chosen };

type Failure = RecommendBookRejection | "offline";

function toCatalogueBook(result: CatalogueResultView): CatalogueBook {
  return {
    source: result.source,
    sourceId: result.sourceId,
    title: result.title,
    subtitle: result.subtitle,
    authors: result.authors,
    year: result.year,
    language: result.language,
    coverRef: result.coverRef,
  };
}

type RecommendBookFormProps = {
  onClose: () => void;
  onPlaced: (options: {
    bookId: number;
    title: string;
    isNewBook: boolean;
  }) => void;
};

export function RecommendBookForm(props: RecommendBookFormProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.bookshelf.form;
  const [step, setStep] = useState<Step>({ kind: "find" });
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<Search>({ kind: "idle" });
  const [manual, setManual] = useState({
    title: "",
    subtitle: "",
    authors: "",
  });
  const [note, setNote] = useState("");
  const [signOff, setSignOff] = useState("");
  const [failure, setFailure] = useState<Failure>();
  const [isPlacing, setIsPlacing] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus({ preventScroll: true });
  }, [step.kind]);

  useEffect(() => {
    const trimmed = query.trim();
    if ([...trimmed].length < 2) {
      setSearch({ kind: "idle" });
      return;
    }
    let isCancelled = false;
    setSearch({ kind: "searching" });
    const timer = window.setTimeout(() => {
      searchCatalogue(trimmed)
        .catch(() => ({ kind: "offline" as const }))
        .then((result) => {
          if (!isCancelled) setSearch(result);
        });
    }, SEARCH_DELAY_MS);
    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  async function place(chosen: Chosen) {
    const body = note.trim();
    if (body === "") return setFailure("empty_body");
    if (LINK.test(`${body} ${signOff}`)) return setFailure("contains_link");
    setFailure(undefined);
    setIsPlacing(true);
    const result = await recommendBook({
      book:
        chosen.kind === "catalogue"
          ? {
              kind: "catalogue",
              book: toCatalogueBook(chosen.result),
              token: chosen.result.token,
            }
          : {
              kind: "manual",
              title: chosen.title,
              subtitle: chosen.subtitle,
              authors: chosen.authors,
            },
      body,
      signOff: signOff.trim() || undefined,
    }).catch(() => ({ kind: "offline" as const }));
    setIsPlacing(false);
    if (result.kind === "placed") {
      props.onPlaced({
        bookId: result.bookId,
        title: chosen.kind === "catalogue" ? chosen.result.title : chosen.title,
        isNewBook: result.isNewBook,
      });
      return;
    }
    setFailure(result.kind === "rejected" ? result.reason : "offline");
  }

  const header = (title: string) => (
    <div className="flex items-start justify-between gap-x-3 px-2 pb-2">
      <h2 className="pt-1 font-[family-name:var(--lm-font-display)] text-[17px] text-[var(--lm-ink-hi)]">
        {title}
      </h2>
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
  );

  if (step.kind === "find") {
    return (
      <div className="flex min-h-0 flex-col font-[family-name:var(--lm-font-mono)] text-[12px]">
        {header(text.title)}
        <div className="flex min-h-0 flex-col gap-y-3 overflow-y-auto px-2 pb-2">
          <p className="opacity-75">{text.searchIntro}</p>
          <input
            ref={firstFieldRef}
            type="search"
            aria-label={text.searchLabel}
            placeholder={text.searchPlaceholder}
            value={query}
            maxLength={120}
            autoComplete="off"
            className={BOOKSHELF_INPUT_CLASS}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <div aria-live="polite" className="flex flex-col gap-y-1.5">
            {search.kind === "searching" && (
              <p className="opacity-70">{text.searching}</p>
            )}
            {search.kind === "offline" && (
              <p className="opacity-70">{text.searchOffline}</p>
            )}
            {search.kind === "results" && search.results.length === 0 && (
              <p className="opacity-70">{text.noResults}</p>
            )}
            {search.kind === "results" &&
              search.results.map((result) => (
                <button
                  key={`${result.source}:${result.sourceId}`}
                  type="button"
                  className="flex cursor-pointer items-center gap-x-3 rounded-md border border-[var(--lm-edge)] p-2 text-left outline-none hover:border-[var(--lm-accent)] focus-visible:border-[var(--lm-accent)]"
                  onClick={() =>
                    setStep({
                      kind: "note",
                      chosen: { kind: "catalogue", result },
                    })
                  }
                >
                  <BookCover
                    book={{
                      title: result.title,
                      authors: result.authors,
                      coverUrl: result.coverUrl,
                      source: result.source,
                    }}
                    widthPx={34}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-y-0.5">
                    <span
                      dir="auto"
                      className="truncate font-[family-name:var(--lm-font-display)] text-[14px] text-[var(--lm-ink-hi)]"
                    >
                      {result.title}
                    </span>
                    <span
                      dir="auto"
                      className="truncate text-[11px] opacity-75"
                    >
                      {[result.authors, result.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {result.shelfBook !== undefined && (
                    <span className="shrink-0 text-[10px] text-[var(--lm-accent)] lowercase">
                      {text.onShelf({
                        loves: copy.bookshelf.loves({
                          count: result.shelfBook.voteCount,
                        }),
                      })}
                    </span>
                  )}
                </button>
              ))}
          </div>
          <button
            type="button"
            className={`${BOOKSHELF_TEXT_BUTTON_CLASS} self-start underline underline-offset-2`}
            onClick={() => setStep({ kind: "manual" })}
          >
            {text.addByHand}
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "manual") {
    const isReady = manual.title.trim() !== "" && manual.authors.trim() !== "";
    return (
      <form
        className="flex min-h-0 flex-col font-[family-name:var(--lm-font-mono)] text-[12px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (isReady)
            setStep({ kind: "note", chosen: { kind: "manual", ...manual } });
        }}
      >
        {header(text.manualTitle)}
        <div className="flex min-h-0 flex-col gap-y-3 overflow-y-auto px-2 pb-2">
          {(
            [
              ["title", text.titleLabel, BOOK_TEXT_LIMITS.title],
              ["subtitle", text.subtitleLabel, BOOK_TEXT_LIMITS.subtitle],
              ["authors", text.authorsLabel, BOOK_TEXT_LIMITS.authors],
            ] as const
          ).map(([field, label, maxLength], index) => (
            <label key={field} className="flex flex-col gap-y-1.5">
              <span className="lowercase">{label}</span>
              <input
                ref={index === 0 ? firstFieldRef : undefined}
                value={manual[field]}
                maxLength={maxLength}
                required={field !== "subtitle"}
                className={BOOKSHELF_INPUT_CLASS}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setManual((current) => ({ ...current, [field]: value }));
                }}
              />
            </label>
          ))}
          <div className="flex justify-between gap-x-2">
            <button
              type="button"
              className={BOOKSHELF_TEXT_BUTTON_CLASS}
              onClick={() => setStep({ kind: "find" })}
            >
              {text.back}
            </button>
            <button
              type="submit"
              className={BOOKSHELF_PRIMARY_BUTTON_CLASS}
              disabled={!isReady}
            >
              {text.next}
            </button>
          </div>
        </div>
      </form>
    );
  }

  const { chosen } = step;
  const shelfBook =
    chosen.kind === "catalogue" ? chosen.result.shelfBook : undefined;
  const coverBook =
    chosen.kind === "catalogue"
      ? {
          title: chosen.result.title,
          authors: chosen.result.authors,
          coverUrl: chosen.result.coverUrl,
          source: chosen.result.source,
        }
      : {
          title: chosen.title,
          authors: chosen.authors,
          coverUrl: undefined,
          source: "manual" as const,
        };
  return (
    <form
      className="flex min-h-0 flex-col font-[family-name:var(--lm-font-mono)] text-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        void place(chosen);
      }}
    >
      {header(text.noteLabel)}
      <div className="flex min-h-0 flex-col gap-y-3 overflow-y-auto px-2 pb-2">
        <div className="flex items-center gap-x-3">
          <BookCover book={coverBook} widthPx={40} />
          <div className="flex min-w-0 flex-col gap-y-0.5">
            <span
              dir="auto"
              className="truncate font-[family-name:var(--lm-font-display)] text-[14px] text-[var(--lm-ink-hi)]"
            >
              {coverBook.title}
            </span>
            <span dir="auto" className="truncate text-[11px] opacity-75">
              {coverBook.authors}
            </span>
          </div>
        </div>
        {shelfBook !== undefined && (
          <p className="border-l-2 border-[var(--lm-accent)] pl-2.5 leading-relaxed">
            {text.merge({
              loves: copy.bookshelf.loves({ count: shelfBook.voteCount }),
            })}
          </p>
        )}
        <label className="flex flex-col gap-y-1.5">
          <span className="sr-only">{text.noteLabel}</span>
          <textarea
            ref={firstFieldRef}
            value={note}
            rows={3}
            maxLength={BOOK_TEXT_LIMITS.note}
            placeholder={text.notePlaceholder}
            className={`${BOOKSHELF_INPUT_CLASS} resize-none font-[family-name:var(--lm-font-display)] text-[15px] leading-relaxed`}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
          <span className="self-end text-[10px] tabular-nums opacity-60">
            {[...note].length}/{BOOK_TEXT_LIMITS.note}
          </span>
        </label>
        <label className="flex flex-col gap-y-1.5">
          <span className="lowercase">{text.signOffLabel}</span>
          <input
            value={signOff}
            maxLength={BOOK_TEXT_LIMITS.signOff}
            placeholder={text.signOffPlaceholder}
            className={BOOKSHELF_INPUT_CLASS}
            onChange={(event) => setSignOff(event.currentTarget.value)}
          />
        </label>
        {failure !== undefined && (
          <p role="alert" className="text-[11px] text-[var(--lm-danger)]">
            {text.failures[failure]}
          </p>
        )}
        <p className="text-[11px] leading-relaxed opacity-65">{text.rules}</p>
        <div className="flex justify-between gap-x-2">
          <button
            type="button"
            className={BOOKSHELF_TEXT_BUTTON_CLASS}
            onClick={() =>
              setStep(
                chosen.kind === "manual" ? { kind: "manual" } : { kind: "find" }
              )
            }
          >
            {text.back}
          </button>
          <button
            type="submit"
            className={BOOKSHELF_PRIMARY_BUTTON_CLASS}
            disabled={isPlacing}
          >
            {isPlacing
              ? text.placing
              : shelfBook !== undefined
                ? text.submitMerge
                : text.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
