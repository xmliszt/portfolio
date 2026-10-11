import "server-only";

import { getDraftPlacement } from "@/lib/laundromat/notebook/get-draft-placement";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";

import type {
  LeaveEntryResult,
  NotebookEntryView,
  NotebookResult,
  NotebookView,
  ShelfResult,
} from "./notebook-actions";

const PAGE_COUNT = 48;
const LINES_PER_PAGE = 24;
const FILLED_BOOK_COUNT = 6;
const CURRENT_BOOK_ENTRY_COUNT = 14;
const CHARS_PER_LINE = 22;
const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_BOOK_STARTED_AT_MS = Date.parse("2026-01-04T10:00:00Z");
const DAYS_PER_BOOK = 40;

const SAMPLE_ENTRIES: { body: string; script: NotebookScript }[] = [
  {
    body: "the dryer on the end eats socks. you have been warned.",
    script: "latin",
  },
  {
    body: "waiting for a 45 minute wash and reading every page of this book.",
    script: "latin",
  },
  { body: "빨래 기다리면서 커피 한 잔. 오늘은 조용하네요.", script: "korean" },
  { body: "雨の日のコインランドリーが好きです。", script: "japanese" },
  { body: "第一次来这里，音乐很好听。", script: "chinese" },
  {
    body: "came in to dry one blanket and stayed for the whole tv station rotation",
    script: "latin",
  },
  { body: "مساء الخير من المغسلة", script: "arabic" },
  {
    body: "if you found a blue scarf on stool two, it is mine. keep it warm.",
    script: "latin",
  },
  { body: "שלום מהמכבסה", script: "hebrew" },
  { body: "कपड़े सूख रहे हैं, मैं भी आराम कर रहा हूँ।", script: "devanagari" },
  { body: "লন্ড্রিতে বসে বৃষ্টি দেখছি।", script: "bengali" },
  {
    body: "3 a.m. club checking in. the coffee is still hot.",
    script: "latin",
  },
  {
    body: "long one today: moved cities last week, everything I own fits in two loads now. strangely freeing. the hum of the machines sounds like the old apartment's fridge.",
    script: "latin",
  },
  { body: "hi", script: "latin" },
];

function getLineCount(body: string) {
  return Math.ceil(body.length / CHARS_PER_LINE) + 1;
}

function buildEntries(options: {
  bookNumber: number;
  startedAtMs: number;
  maxEntries: number;
}) {
  const capacity = PAGE_COUNT * LINES_PER_PAGE;
  return Array.from({ length: options.maxEntries }).reduce<{
    entries: NotebookEntryView[];
    linesUsed: number;
  }>(
    (book, _, index) => {
      const sample = SAMPLE_ENTRIES[index % SAMPLE_ENTRIES.length];
      const lineCount = getLineCount(sample.body);
      if (book.linesUsed + lineCount > capacity) return book;
      const placement = getDraftPlacement({
        linesUsed: book.linesUsed,
        lineCount,
        linesPerPage: LINES_PER_PAGE,
        pageCount: PAGE_COUNT,
      });
      const entry = {
        id: options.bookNumber * 10_000 + index,
        page: placement.page,
        lineStart: placement.lineStart,
        lineCount,
        body: sample.body,
        signOff: null,
        script: sample.script,
        createdAt: new Date(
          options.startedAtMs + index * (DAY_MS / 8)
        ).toISOString(),
      } satisfies NotebookEntryView;
      return {
        entries: [...book.entries, entry],
        linesUsed: book.linesUsed + lineCount,
      };
    },
    { entries: [], linesUsed: 0 }
  );
}

function buildBook(number: number): NotebookView {
  const startedAtMs =
    FIRST_BOOK_STARTED_AT_MS + (number - 1) * DAYS_PER_BOOK * DAY_MS;
  const isFilled = number <= FILLED_BOOK_COUNT;
  const { entries, linesUsed } = buildEntries({
    bookNumber: number,
    startedAtMs,
    maxEntries: isFilled
      ? PAGE_COUNT * LINES_PER_PAGE
      : CURRENT_BOOK_ENTRY_COUNT,
  });
  return {
    number,
    pageCount: PAGE_COUNT,
    linesPerPage: LINES_PER_PAGE,
    linesUsed: isFilled ? PAGE_COUNT * LINES_PER_PAGE : linesUsed,
    startedAt: new Date(startedAtMs).toISOString(),
    filledAt: isFilled
      ? new Date(startedAtMs + DAYS_PER_BOOK * DAY_MS).toISOString()
      : null,
    entries,
  };
}

/** Return an in-memory stand-in for the notebook tables, seeded with filled books and a part-written current book. */
export function createFakeNotebookStore() {
  const books = Array.from({ length: FILLED_BOOK_COUNT + 1 }, (_, index) =>
    buildBook(index + 1)
  );

  function getCurrent() {
    return books.at(-1) ?? buildBook(1);
  }

  function loadShelf(): ShelfResult {
    const current = getCurrent();
    return {
      kind: "online",
      currentNumber: current.number,
      currentEntryCount: current.entries.length,
      books: books.flatMap((book) =>
        book.filledAt === null
          ? []
          : [
              {
                number: book.number,
                startedAt: book.startedAt,
                filledAt: book.filledAt,
                entryCount: book.entries.length,
              },
            ]
      ),
    };
  }

  function loadNotebook(number: number | undefined): NotebookResult {
    const notebook =
      number === undefined
        ? getCurrent()
        : books.find((book) => book.number === number);
    return notebook === undefined
      ? { kind: "missing" }
      : { kind: "online", notebook };
  }

  function leaveEntry(options: {
    body: string;
    script: NotebookScript;
    lineCount: number;
  }): LeaveEntryResult {
    const current = getCurrent();
    const placement = getDraftPlacement({
      linesUsed: current.linesUsed,
      lineCount: options.lineCount,
      linesPerPage: current.linesPerPage,
      pageCount: current.pageCount,
    });
    const now = new Date().toISOString();
    if (placement.startsNewBook) {
      current.filledAt = now;
      books.push({
        ...buildBook(current.number + 1),
        entries: [],
        linesUsed: 0,
      });
    }
    const book = getCurrent();
    const entry = {
      id: Date.now(),
      page: placement.startsNewBook ? 1 : placement.page,
      lineStart: placement.startsNewBook ? 1 : placement.lineStart,
      lineCount: options.lineCount,
      body: options.body,
      signOff: null,
      script: options.script,
      createdAt: now,
    } satisfies NotebookEntryView;
    book.entries.push(entry);
    book.linesUsed += options.lineCount;
    if (book.linesUsed >= book.pageCount * book.linesPerPage) {
      book.filledAt = now;
      books.push({ ...buildBook(book.number + 1), entries: [], linesUsed: 0 });
    }
    return { kind: "placed", entry, notebookNumber: book.number };
  }

  return { loadShelf, loadNotebook, leaveEntry };
}
