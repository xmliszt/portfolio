"use server";

import { keyBy, uniq } from "lodash";
import { cookies } from "next/headers";
import { z } from "zod";

import { readOrCreateVisitorCookieId } from "@/app/laundromat/read-or-create-visitor-cookie-id";
import { readVisitorCookieId } from "@/app/laundromat/read-visitor-cookie-id";
import { BOOK_TEXT_LIMITS } from "@/lib/laundromat/bookshelf/book-text-limits";
import {
  type BookSource,
  CATALOGUE_SOURCES,
  type CatalogueBook,
} from "@/lib/laundromat/bookshelf/catalogue-book";
import { clipText } from "@/lib/laundromat/bookshelf/clip-text";
import { getBookCoverUrl } from "@/lib/laundromat/bookshelf/get-book-cover-url";
import { getBookInfoUrl } from "@/lib/laundromat/bookshelf/get-book-info-url";
import { getCatalogueMatchKey } from "@/lib/laundromat/bookshelf/get-catalogue-match-key";
import { isCatalogueBookSigned } from "@/lib/laundromat/bookshelf/is-catalogue-book-signed";
import { mergeCatalogueResults } from "@/lib/laundromat/bookshelf/merge-catalogue-results";
import { searchGoogleBooks } from "@/lib/laundromat/bookshelf/search-google-books";
import { searchOpenLibrary } from "@/lib/laundromat/bookshelf/search-open-library";
import { signCatalogueBook } from "@/lib/laundromat/bookshelf/sign-catalogue-book";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";
import { maskProfanity } from "@/lib/laundromat/notebook/mask-profanity";
import { MAX_TRANSLATED_ENTRIES } from "@/lib/laundromat/notebook/max-translated-entries";
import { mergeEntryTranslations } from "@/lib/laundromat/notebook/merge-entry-translations";
import { REPORT_REASON_MAX_CHARS } from "@/lib/laundromat/notebook/report-reason-max-chars";
import { translateNotes } from "@/lib/laundromat/notebook/translate-notes";
import type {
  Book,
  RecommendBookRejection,
} from "@/lib/laundromat/supabase/bookshelf-types";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { findBooksBySourceIds } from "@/lib/laundromat/supabase/find-books-by-source-ids";
import { getBookNoteTranslations } from "@/lib/laundromat/supabase/get-book-note-translations";
import { getVisibleBookNotesById } from "@/lib/laundromat/supabase/get-visible-book-notes-by-id";
import { listLatestVisibleBookNotes } from "@/lib/laundromat/supabase/list-latest-visible-book-notes";
import { listShelfBooks } from "@/lib/laundromat/supabase/list-shelf-books";
import { listVisibleBookNotes } from "@/lib/laundromat/supabase/list-visible-book-notes";
import { listVisitorBookVotes } from "@/lib/laundromat/supabase/list-visitor-book-votes";
import { recommendBook as recommendBookRow } from "@/lib/laundromat/supabase/recommend-book";
import { reportBookNote as reportBookNoteRow } from "@/lib/laundromat/supabase/report-book-note";
import { saveBookNoteTranslations } from "@/lib/laundromat/supabase/save-book-note-translations";
import { setBookVote } from "@/lib/laundromat/supabase/set-book-vote";

import { createFakeBookshelfStore } from "./create-fake-bookshelf-store";

const FAKE_BOOKSHELF_COOKIE = "laundromat_fake_bookshelf";
const SHELF_LOAD_LIMIT = 240;
const NOTES_LOAD_LIMIT = 200;
const SEARCH_LIMIT = 8;
const SEARCH_TIMEOUT_MS = 4000;
const MAX_QUERY_CHARS = 120;
const TRANSLATION_MODEL = "openai/gpt-4.1-mini";

const devFakeBookshelfStore =
  process.env.NODE_ENV === "development"
    ? createFakeBookshelfStore()
    : undefined;

export type BookNoteView = {
  id: number;
  body: string;
  signOff: string | undefined;
  createdAt: string;
};

export type ShelfBookView = {
  id: number;
  source: BookSource;
  title: string;
  subtitle: string | undefined;
  authors: string;
  year: number | undefined;
  language: string | undefined;
  coverUrl: string | undefined;
  infoUrl: string | undefined;
  voteCount: number;
  noteCount: number;
  createdAt: string;
  isLovedByMe: boolean;
  latestNote: BookNoteView | undefined;
};

export type BookshelfResult =
  | { kind: "online"; mostLoved: ShelfBookView[]; newest: ShelfBookView[] }
  | { kind: "offline" };

export type BookNotesResult =
  | { kind: "online"; notes: BookNoteView[] }
  | { kind: "offline" };

export type CatalogueResultView = CatalogueBook & {
  token: string;
  coverUrl: string | undefined;
  shelfBook: { id: number; voteCount: number } | undefined;
};

export type SearchCatalogueResult =
  | { kind: "results"; results: CatalogueResultView[] }
  | { kind: "offline" };

export type RecommendBookResult =
  | { kind: "placed"; bookId: number; isNewBook: boolean }
  | { kind: "rejected"; reason: RecommendBookRejection }
  | { kind: "offline" };

export type BookVoteResult =
  | { kind: "saved"; voteCount: number }
  | { kind: "offline" };

export type ReportBookNoteResult = { kind: "reported" } | { kind: "offline" };

export type BookNoteTranslation = {
  entryId: number;
  body: string | undefined;
  sourceLanguage: string;
};

export type TranslateBookNotesResult =
  | { kind: "translated"; translations: BookNoteTranslation[] }
  | { kind: "offline" };

const CATALOGUE_BOOK_INPUT = z.object({
  source: z.enum(CATALOGUE_SOURCES),
  sourceId: z.string().max(32),
  title: z.string().max(BOOK_TEXT_LIMITS.title * 2),
  subtitle: z
    .string()
    .max(BOOK_TEXT_LIMITS.subtitle * 2)
    .optional(),
  authors: z.string().max(BOOK_TEXT_LIMITS.authors * 2),
  year: z.number().int().optional(),
  language: z.string().max(8).optional(),
  coverRef: z.string().max(32).optional(),
});

const RECOMMEND_INPUT = z.object({
  book: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("catalogue"),
      book: CATALOGUE_BOOK_INPUT,
      token: z.string().max(128),
    }),
    z.object({
      kind: z.literal("manual"),
      title: z.string().max(BOOK_TEXT_LIMITS.title * 2),
      subtitle: z
        .string()
        .max(BOOK_TEXT_LIMITS.subtitle * 2)
        .optional(),
      authors: z.string().max(BOOK_TEXT_LIMITS.authors * 2),
    }),
  ]),
  body: z.string().max(BOOK_TEXT_LIMITS.note * 4),
  signOff: z
    .string()
    .max(BOOK_TEXT_LIMITS.signOff * 4)
    .optional(),
});

export type RecommendBookInput = z.input<typeof RECOMMEND_INPUT>;

async function readFakeBookshelf() {
  if (devFakeBookshelfStore === undefined) return undefined;
  const cookieStore = await cookies();
  return cookieStore.get(FAKE_BOOKSHELF_COOKIE)?.value === "1"
    ? devFakeBookshelfStore
    : undefined;
}

function toNoteView(note: {
  id: number;
  body: string;
  sign_off: string | null;
  created_at: string;
}): BookNoteView {
  return {
    id: note.id,
    body: maskProfanity(note.body),
    signOff: note.sign_off === null ? undefined : maskProfanity(note.sign_off),
    createdAt: note.created_at,
  };
}

function toShelfBookView(options: {
  book: Book;
  lovedIds: number[];
  latestNote: BookNoteView | undefined;
}): ShelfBookView {
  const { book } = options;
  const source =
    book.source === "openlibrary" || book.source === "googlebooks"
      ? book.source
      : "manual";
  const maskIfManual = (text: string) =>
    source === "manual" ? maskProfanity(text) : text;
  return {
    id: book.id,
    source,
    title: maskIfManual(book.title),
    subtitle: book.subtitle === null ? undefined : maskIfManual(book.subtitle),
    authors: maskIfManual(book.authors),
    year: book.published_year ?? undefined,
    language: book.language ?? undefined,
    coverUrl: getBookCoverUrl({
      source,
      coverRef: book.cover_ref ?? undefined,
    }),
    infoUrl: getBookInfoUrl({ source, sourceId: book.source_id ?? undefined }),
    voteCount: book.vote_count,
    noteCount: book.visible_note_count,
    createdAt: book.created_at,
    isLovedByMe: options.lovedIds.includes(book.id),
    latestNote: options.latestNote,
  };
}

/** Load the most-loved and newest books that have a visible note, each with its newest note and whether the visitor in the cookie gave it a ♥; never creates the visitor cookie. */
export async function loadBookshelf(): Promise<BookshelfResult> {
  const fake = await readFakeBookshelf();
  if (fake !== undefined) return fake.loadBookshelf();
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "offline" };
  try {
    const [mostLoved, newest] = await Promise.all([
      listShelfBooks({ client, order: "most_loved", limit: SHELF_LOAD_LIMIT }),
      listShelfBooks({ client, order: "newest", limit: SHELF_LOAD_LIMIT }),
    ]);
    const bookIds = uniq([...mostLoved, ...newest].map((book) => book.id));
    const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
    const visitorId = secret ? await readVisitorCookieId(secret) : undefined;
    const [latestNotes, lovedIds] = await Promise.all([
      listLatestVisibleBookNotes({ client, bookIds }),
      visitorId === undefined
        ? []
        : listVisitorBookVotes({ client, visitorId, bookIds }),
    ]);
    const latestByBook = keyBy(latestNotes, (note) => note.book_id);
    function toView(book: Book) {
      const latest = latestByBook[book.id];
      return toShelfBookView({
        book,
        lovedIds,
        latestNote: latest === undefined ? undefined : toNoteView(latest),
      });
    }
    return {
      kind: "online",
      mostLoved: mostLoved.map(toView),
      newest: newest.map(toView),
    };
  } catch {
    return { kind: "offline" };
  }
}

/** Load the newest `NOTES_LOAD_LIMIT` visible notes on book `bookId`, newest first. */
export async function loadBookNotes(bookId: number): Promise<BookNotesResult> {
  const fake = await readFakeBookshelf();
  if (fake !== undefined) return fake.loadBookNotes(bookId);
  const client = createLaundromatServiceClient();
  if (client === undefined || !Number.isSafeInteger(bookId))
    return { kind: "offline" };
  try {
    const notes = await listVisibleBookNotes({
      client,
      bookId,
      limit: NOTES_LOAD_LIMIT,
    });
    return { kind: "online", notes: notes.map(toNoteView) };
  } catch {
    return { kind: "offline" };
  }
}

/** Search Open Library and Google Books for `query`, returning signed results that say which ones are already on the shelf; one catalogue failing still returns the other's results. */
export async function searchCatalogue(
  query: string
): Promise<SearchCatalogueResult> {
  const trimmed = clipText({ text: query, maxChars: MAX_QUERY_CHARS });
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (!secret) return { kind: "offline" };
  if (trimmed === undefined || [...trimmed].length < 2)
    return { kind: "results", results: [] };
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const [openLibrary, googleBooks] = await Promise.allSettled([
    searchOpenLibrary({
      query: trimmed,
      limit: SEARCH_LIMIT,
      timeoutMs: SEARCH_TIMEOUT_MS,
    }),
    apiKey
      ? searchGoogleBooks({
          query: trimmed,
          limit: SEARCH_LIMIT,
          timeoutMs: SEARCH_TIMEOUT_MS,
          apiKey,
        })
      : Promise.reject(new Error("GOOGLE_BOOKS_API_KEY is not set")),
  ]);
  const queried = apiKey ? [openLibrary, googleBooks] : [openLibrary];
  if (queried.every((search) => search.status === "rejected")) {
    return { kind: "offline" };
  }
  const found = {
    openLibrary: openLibrary.status === "fulfilled" ? openLibrary.value : [],
    googleBooks: googleBooks.status === "fulfilled" ? googleBooks.value : [],
  };
  const everyRecord = [...found.openLibrary, ...found.googleBooks];
  const fake = await readFakeBookshelf();
  const shelfRows = await (async () => {
    if (fake !== undefined) return fake.findBooksBySourceIds(everyRecord);
    const client = createLaundromatServiceClient();
    if (client === undefined) return [];
    try {
      return await findBooksBySourceIds({ client, records: everyRecord });
    } catch {
      return [];
    }
  })();
  function findShelfRow(book: CatalogueBook) {
    return shelfRows.find(
      (row) => row.source === book.source && row.source_id === book.sourceId
    );
  }
  return {
    kind: "results",
    results: mergeCatalogueResults({ ...found, limit: SEARCH_LIMIT }).map(
      (merged) => {
        // prefer the record already on the shelf, so the note joins that book
        const key = getCatalogueMatchKey(merged);
        const book =
          everyRecord.find(
            (record) =>
              getCatalogueMatchKey(record) === key &&
              findShelfRow(record) !== undefined
          ) ?? merged;
        const row = findShelfRow(book);
        return {
          ...book,
          token: signCatalogueBook({ book, secret }),
          coverUrl: getBookCoverUrl({
            source: book.source,
            coverRef: book.coverRef,
          }),
          shelfBook:
            row === undefined || row.visible_note_count === 0
              ? undefined
              : { id: row.id, voteCount: row.vote_count },
        };
      }
    ),
  };
}

/** Put a book on the shelf with the visitor's note, or add the note to the same catalogue book already there, as the visitor in the signed cookie; a catalogue book must carry the token `searchCatalogue` gave it. */
export async function recommendBook(
  input: RecommendBookInput
): Promise<RecommendBookResult> {
  const parsed = RECOMMEND_INPUT.safeParse(input);
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (!secret) return { kind: "offline" };
  if (!parsed.success) return { kind: "rejected", reason: "invalid_book" };
  const { book } = parsed.data;
  const body = parsed.data.body.trim();
  const signOff = parsed.data.signOff?.trim() || undefined;
  const record = (() => {
    if (book.kind === "manual") {
      const title = clipText({
        text: book.title,
        maxChars: BOOK_TEXT_LIMITS.title,
      });
      const authors = clipText({
        text: book.authors,
        maxChars: BOOK_TEXT_LIMITS.authors,
      });
      if (title === undefined || authors === undefined) return undefined;
      return {
        source: "manual" as const,
        sourceId: undefined,
        title,
        subtitle: clipText({
          text: book.subtitle,
          maxChars: BOOK_TEXT_LIMITS.subtitle,
        }),
        authors,
        year: undefined,
        language: undefined,
        coverRef: undefined,
      };
    }
    const catalogueBook: CatalogueBook = {
      ...book.book,
      subtitle: book.book.subtitle,
      year: book.book.year,
      language: book.book.language,
      coverRef: book.book.coverRef,
    };
    return isCatalogueBookSigned({
      book: catalogueBook,
      token: book.token,
      secret,
    })
      ? catalogueBook
      : undefined;
  })();
  if (record === undefined) return { kind: "rejected", reason: "invalid_book" };
  const fake = await readFakeBookshelf();
  if (fake !== undefined)
    return fake.recommendBook({ book: record, body, signOff });
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "offline" };
  try {
    const { visitorId } = await readOrCreateVisitorCookieId(secret);
    const result = await recommendBookRow({
      client,
      visitorId,
      book: record,
      body,
      signOff,
    });
    return result.kind === "rejected"
      ? result
      : { kind: "placed", bookId: result.bookId, isNewBook: result.isNewBook };
  } catch {
    return { kind: "offline" };
  }
}

/** Give book `bookId` the visitor's ♥ when `loved` is `true` or take it back when `false`, creating the visitor cookie on first use. */
export async function setBookLoved(options: {
  bookId: number;
  loved: boolean;
}): Promise<BookVoteResult> {
  const fake = await readFakeBookshelf();
  if (fake !== undefined) return fake.setBookLoved(options);
  const client = createLaundromatServiceClient();
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (client === undefined || !secret || !Number.isSafeInteger(options.bookId))
    return { kind: "offline" };
  try {
    const { visitorId } = await readOrCreateVisitorCookieId(secret);
    const voteCount = await setBookVote({
      client,
      bookId: options.bookId,
      visitorId,
      loved: options.loved,
    });
    return voteCount === undefined
      ? { kind: "offline" }
      : { kind: "saved", voteCount };
  } catch {
    return { kind: "offline" };
  }
}

/** Record the visitor's report of book note `noteId` with the first `REPORT_REASON_MAX_CHARS` characters of `reason`. */
export async function reportBookNote(options: {
  noteId: number;
  reason: string | undefined;
}): Promise<ReportBookNoteResult> {
  const reason = clipText({
    text: options.reason,
    maxChars: REPORT_REASON_MAX_CHARS,
  });
  if ((await readFakeBookshelf()) !== undefined) return { kind: "reported" };
  const client = createLaundromatServiceClient();
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (client === undefined || !secret || !Number.isSafeInteger(options.noteId))
    return { kind: "offline" };
  try {
    const { visitorId } = await readOrCreateVisitorCookieId(secret);
    await reportBookNoteRow({
      client,
      noteId: options.noteId,
      visitorId,
      reason,
    });
    return { kind: "reported" };
  } catch {
    return { kind: "offline" };
  }
}

/** Translate the visible notes in `noteIds` into `locale`, reusing saved translations and saving new ones; `body` is `undefined` for a note already written in `locale`, and hidden or untranslatable notes are left out. */
export async function translateBookNotes(options: {
  noteIds: number[];
  locale: string;
}): Promise<TranslateBookNotesResult> {
  const locale = parseLaundromatLocale(options.locale);
  const noteIds = uniq(
    options.noteIds.filter((id) => Number.isSafeInteger(id) && id > 0)
  ).slice(0, MAX_TRANSLATED_ENTRIES);
  if (locale === undefined || noteIds.length === 0)
    return { kind: "translated", translations: [] };
  try {
    const fake = await readFakeBookshelf();
    if (fake !== undefined) {
      const translations = await translateNotes({
        model: TRANSLATION_MODEL,
        notes: fake.findNotes(noteIds),
        locale,
      });
      return { kind: "translated", translations: translations.map(mask) };
    }
    const client = createLaundromatServiceClient();
    if (client === undefined) return { kind: "offline" };
    const visible = await getVisibleBookNotesById({ client, noteIds });
    const saved = await getBookNoteTranslations({
      client,
      noteIds: visible.map((note) => note.id),
      locale,
    });
    const savedIds = saved.map((row) => row.note_id);
    const missing = visible.filter((note) => !savedIds.includes(note.id));
    const fresh = await translateNotes({
      model: TRANSLATION_MODEL,
      notes: missing,
      locale,
    });
    await saveBookNoteTranslations({ client, locale, translations: fresh });
    return {
      kind: "translated",
      translations: mergeEntryTranslations({
        visibleIds: visible.map((note) => note.id),
        saved: saved.map((row) => ({
          entry_id: row.note_id,
          body: row.body,
          source_language: row.source_language,
        })),
        fresh,
      }).map(mask),
    };
  } catch {
    return { kind: "offline" };
  }
}

function mask(translation: BookNoteTranslation): BookNoteTranslation {
  return {
    ...translation,
    body:
      translation.body === undefined
        ? undefined
        : maskProfanity(translation.body),
  };
}
