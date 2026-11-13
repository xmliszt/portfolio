import "server-only";

import { BOOK_TEXT_LIMITS } from "@/lib/laundromat/bookshelf/book-text-limits";
import type {
  BookSource,
  CatalogueSource,
} from "@/lib/laundromat/bookshelf/catalogue-book";
import { getBookCoverUrl } from "@/lib/laundromat/bookshelf/get-book-cover-url";
import { getBookInfoUrl } from "@/lib/laundromat/bookshelf/get-book-info-url";

import type {
  BookNotesResult,
  BookNoteView,
  BookshelfResult,
  BookVoteResult,
  RecommendBookResult,
  ShelfBookView,
} from "./bookshelf-actions";

const DAY_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 2 * 60 * 1000;

type FakeBook = {
  id: number;
  source: BookSource;
  sourceId: string | undefined;
  title: string;
  subtitle: string | undefined;
  authors: string;
  year: number | undefined;
  coverRef: string | undefined;
  voteCount: number;
  isLovedByMe: boolean;
  createdAtMs: number;
  notes: BookNoteView[];
};

const SAMPLE_BOOKS: {
  title: string;
  authors: string;
  year: number;
  votes: number;
  daysAgo: number;
  note: string;
  signOff?: string;
  openLibrary?: { workId: string; coverId: string };
}[] = [
  {
    title: "Yeonnam-Dong's Smiley Laundromat",
    authors: "Kim Jiyun",
    year: 2023,
    votes: 41,
    daysAgo: 40,
    note: "The book this laundromat is named after. Read it while your towels dry.",
    signOff: "the owner",
  },
  {
    title: "Le Petit Prince",
    authors: "Antoine de Saint-Exupéry",
    year: 1943,
    votes: 36,
    daysAgo: 60,
    note: "On ne voit bien qu'avec le cœur.",
    signOff: "Claire, Lyon",
  },
  {
    title: "Before the Coffee Gets Cold",
    authors: "Toshikazu Kawaguchi",
    year: 2015,
    votes: 33,
    daysAgo: 31,
    note: "Short chapters. Perfect for one dryer cycle each.",
    signOff: "Ana, Lisbon",
  },
  {
    title: "A Psalm for the Wild-Built",
    authors: "Becky Chambers",
    year: 2021,
    votes: 31,
    daysAgo: 20,
    note: "A tea monk and a robot walk through a forest. That's the whole book.",
    signOff: "Sam",
  },
  {
    title: "Four Thousand Weeks",
    authors: "Oliver Burkeman",
    year: 2021,
    votes: 30,
    daysAgo: 6,
    note: "Calmer than any productivity book.",
    signOff: "Priya",
  },
  {
    title: "Welcome to the Hyunam-dong Bookshop",
    authors: "Hwang Bo-reum",
    year: 2022,
    votes: 29,
    daysAgo: 26,
    note: "For anyone who wants to quit and open a small shop.",
    signOff: "Jun",
  },
  {
    title: "Stoner",
    authors: "John Williams",
    year: 1965,
    votes: 27,
    daysAgo: 38,
    note: "Nothing happens and it is the best book I have read.",
    signOff: "Marta",
  },
  {
    title: "Small Things Like These",
    authors: "Claire Keegan",
    year: 2021,
    votes: 26,
    daysAgo: 8,
    note: "110 pages. You can finish it before your laundry does.",
    signOff: "Aoife",
  },
  {
    title: "コンビニ人間",
    authors: "村田沙耶香",
    year: 2016,
    votes: 25,
    daysAgo: 45,
    note: "Funny and unsettling.",
    signOff: "Kenji",
  },
  {
    title: "Pachinko",
    authors: "Min Jin Lee",
    year: 2017,
    votes: 24,
    daysAgo: 30,
    note: "Four generations, one family. I cried on the bus.",
    signOff: "Grace",
  },
  {
    title: "Never Let Me Go",
    authors: "Kazuo Ishiguro",
    year: 2005,
    votes: 23,
    daysAgo: 48,
    note: "Do not read the blurb. Just start.",
    signOff: "Yuki",
  },
  {
    title: "活着",
    authors: "余华",
    year: 1993,
    votes: 21,
    daysAgo: 34,
    note: "读完很久说不出话。",
    signOff: "小林",
  },
  {
    title: "아몬드",
    authors: "Won-Pyung Sohn",
    year: 2020,
    votes: 15,
    daysAgo: 11,
    note: "감정을 못 느끼는 소년 이야기. 짧고 강해요.",
    signOff: "민호",
    openLibrary: { workId: "OL20758187W", coverId: "11654300" },
  },
  {
    title: "Piranesi",
    authors: "Susanna Clarke",
    year: 2020,
    votes: 19,
    daysAgo: 18,
    note: "Strange and calm. The house is the ocean.",
    signOff: "lu",
  },
  {
    title: "موسم الهجرة إلى الشمال",
    authors: "الطيب صالح",
    year: 1966,
    votes: 9,
    daysAgo: 12,
    note: "رواية عن العودة إلى البيت.",
    signOff: "سارة",
  },
  {
    title: "キッチン",
    authors: "吉本ばなな",
    year: 1988,
    votes: 13,
    daysAgo: 14,
    note: "台所が好きな人へ。",
    signOff: "ゆき",
  },
  {
    title: "The Memory Police",
    authors: "Yoko Ogawa",
    year: 1994,
    votes: 8,
    daysAgo: 4,
    note: "Things disappear from an island and people forget them.",
    signOff: "Lea",
  },
  {
    title: "围城",
    authors: "钱锺书",
    year: 1947,
    votes: 6,
    daysAgo: 3,
    note: "写婚姻和知识分子，刻薄又好笑。",
    signOff: "老周",
  },
  {
    title: "Finn Family Moomintroll",
    authors: "Tove Jansson",
    year: 1948,
    votes: 9,
    daysAgo: 2,
    note: "For the child in you. And the hat.",
    signOff: "Linnea",
  },
  {
    title: "The Old Man and the Sea",
    authors: "Ernest Hemingway",
    year: 1952,
    votes: 5,
    daysAgo: 2,
    note: "Short enough for a wash cycle.",
    signOff: "Kofi",
  },
  {
    title: "Human Acts",
    authors: "Han Kang",
    year: 2014,
    votes: 3,
    daysAgo: 1,
    note: "Hard to read and important. Take breaks.",
    signOff: "Seo-yeon",
  },
  {
    title: "Foster",
    authors: "Claire Keegan",
    year: 2010,
    votes: 4,
    daysAgo: 0.4,
    note: "A girl, a summer, a family that is kind to her.",
  },
  {
    title: "Frankenstein",
    authors: "Mary Shelley",
    year: 1818,
    votes: 1,
    daysAgo: 0.1,
    note: "Not what the films told you. It's a sad book.",
    signOff: "M.",
  },
];

/** Return an in-memory stand-in for the bookshelf tables, seeded with sample books and notes, that keeps changes until the dev server restarts. */
export function createFakeBookshelfStore() {
  const startedAtMs = Date.now();
  let nextNoteId = 1;
  let lastRecommendedAtMs = -Infinity;
  const books: FakeBook[] = SAMPLE_BOOKS.map((sample, index) => ({
    id: index + 1,
    source: sample.openLibrary === undefined ? "manual" : "openlibrary",
    sourceId: sample.openLibrary?.workId,
    title: sample.title,
    subtitle: undefined,
    authors: sample.authors,
    year: sample.year,
    coverRef: sample.openLibrary?.coverId,
    voteCount: sample.votes,
    isLovedByMe: false,
    createdAtMs: startedAtMs - sample.daysAgo * DAY_MS,
    notes: [
      {
        id: nextNoteId++,
        body: sample.note,
        signOff: sample.signOff,
        createdAt: new Date(
          startedAtMs - sample.daysAgo * DAY_MS
        ).toISOString(),
      },
    ],
  }));

  function toView(book: FakeBook): ShelfBookView {
    return {
      id: book.id,
      source: book.source,
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      year: book.year,
      language: undefined,
      coverUrl: getBookCoverUrl({
        source: book.source,
        coverRef: book.coverRef,
      }),
      infoUrl: getBookInfoUrl({ source: book.source, sourceId: book.sourceId }),
      voteCount: book.voteCount,
      noteCount: book.notes.length,
      createdAt: new Date(book.createdAtMs).toISOString(),
      isLovedByMe: book.isLovedByMe,
      latestNote: book.notes.at(0),
    };
  }

  function loadBookshelf(): BookshelfResult {
    return {
      kind: "online",
      mostLoved: books
        .toSorted(
          (a, b) => b.voteCount - a.voteCount || b.createdAtMs - a.createdAtMs
        )
        .map(toView),
      newest: books
        .toSorted((a, b) => b.createdAtMs - a.createdAtMs)
        .map(toView),
    };
  }

  function loadBookNotes(bookId: number): BookNotesResult {
    const book = books.find((candidate) => candidate.id === bookId);
    return book === undefined
      ? { kind: "offline" }
      : { kind: "online", notes: book.notes };
  }

  function findBooksBySourceIds(
    records: { source: CatalogueSource; sourceId: string }[]
  ) {
    return books
      .filter((book) =>
        records.some(
          (record) =>
            record.source === book.source && record.sourceId === book.sourceId
        )
      )
      .map((book) => ({
        id: book.id,
        source: book.source,
        source_id: book.sourceId ?? null,
        vote_count: book.voteCount,
        visible_note_count: book.notes.length,
      }));
  }

  function recommendBook(options: {
    book: {
      source: BookSource;
      sourceId: string | undefined;
      title: string;
      subtitle: string | undefined;
      authors: string;
      year: number | undefined;
      coverRef: string | undefined;
    };
    body: string;
    signOff: string | undefined;
  }): RecommendBookResult {
    const body = options.body.trim();
    if (body === "") return { kind: "rejected", reason: "empty_body" };
    if ([...body].length > BOOK_TEXT_LIMITS.note) {
      return { kind: "rejected", reason: "body_too_long" };
    }
    if (
      [...(options.signOff?.trim() ?? "")].length > BOOK_TEXT_LIMITS.signOff
    ) {
      return { kind: "rejected", reason: "sign_off_too_long" };
    }
    if (
      /(https?:\/\/|www\.)/i.test(
        `${body} ${options.signOff ?? ""} ${options.book.title}`
      )
    ) {
      return { kind: "rejected", reason: "contains_link" };
    }
    if (Date.now() - lastRecommendedAtMs < RATE_LIMIT_MS)
      return { kind: "rejected", reason: "rate_limited" };
    lastRecommendedAtMs = Date.now();
    const note: BookNoteView = {
      id: nextNoteId++,
      body,
      signOff: options.signOff?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const existing = books.find(
      (book) =>
        options.book.source !== "manual" &&
        book.source === options.book.source &&
        book.sourceId === options.book.sourceId
    );
    if (existing !== undefined) {
      existing.notes.unshift(note);
      if (!existing.isLovedByMe) {
        existing.isLovedByMe = true;
        existing.voteCount += 1;
      }
      return { kind: "placed", bookId: existing.id, isNewBook: false };
    }
    const id = books.length + 1;
    books.push({
      ...options.book,
      id,
      voteCount: 1,
      isLovedByMe: true,
      createdAtMs: Date.now(),
      notes: [note],
    });
    return { kind: "placed", bookId: id, isNewBook: true };
  }

  function setBookLoved(options: {
    bookId: number;
    loved: boolean;
  }): BookVoteResult {
    const book = books.find((candidate) => candidate.id === options.bookId);
    if (book === undefined) return { kind: "offline" };
    if (book.isLovedByMe !== options.loved) {
      book.isLovedByMe = options.loved;
      book.voteCount += options.loved ? 1 : -1;
    }
    return { kind: "saved", voteCount: book.voteCount };
  }

  function findNotes(noteIds: number[]) {
    return books
      .flatMap((book) => book.notes)
      .filter((note) => noteIds.includes(note.id))
      .map((note) => ({ id: note.id, body: note.body }));
  }

  return {
    loadBookshelf,
    loadBookNotes,
    findBooksBySourceIds,
    recommendBook,
    setBookLoved,
    findNotes,
  };
}
