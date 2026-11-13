"use client";

import { useState } from "react";

import type { BookshelfView } from "@/app/laundromat/objects/scene-views";
import {
  BOOKSHELF_ROW_KEYS,
  type BookshelfRowKey,
} from "@/lib/laundromat/bookshelf/bookshelf-row";
import { describeBookshelf } from "@/lib/laundromat/bookshelf/describe-bookshelf";
import { getBookshelfBookId } from "@/lib/laundromat/bookshelf/get-bookshelf-book-id";
import { getBookshelfBookOutline } from "@/lib/laundromat/bookshelf/get-bookshelf-book-outline";
import { getBookshelfBookPlacements } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import { getBookshelfFaceOutline } from "@/lib/laundromat/bookshelf/get-bookshelf-face-outline";
import { getBookshelfLabelHolder } from "@/lib/laundromat/bookshelf/get-bookshelf-label-holder";
import { getBookshelfRows } from "@/lib/laundromat/bookshelf/get-bookshelf-rows";
import { paginateBookshelfRow } from "@/lib/laundromat/bookshelf/paginate-bookshelf-row";
import type {
  SceneLayout,
  ScreenBounds,
} from "@/lib/laundromat/build-scene-layout";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import type { ShelfBookView } from "./bookshelf-actions";
import { useBookshelf } from "./use-bookshelf";

export type BookshelfHitTarget = {
  id: string;
  outline: ScreenPoint[];
  bounds: ScreenBounds;
  label: string;
  tooltip: string | undefined;
  onActivate: () => void;
};

/** Return the bookshelf's data, its description, what the scene draws for it and the hit targets of its books and page tabs, keeping the page each shelf shows. */
export function useBookshelfScene(options: {
  layout: SceneLayout;
  config: SceneConfig;
  copy: LaundromatCopy;
  highlightedId: string | undefined;
  onOpenBook: (options: { row: BookshelfRowKey; book: ShelfBookView }) => void;
}) {
  const { layout, copy } = options;
  const { bookshelf, refresh } = useBookshelf();
  const [pages, setPages] = useState({ loved: 0, fresh: 0 });
  const [directions, setDirections] = useState<{
    [key in BookshelfRowKey]: 1 | -1;
  }>({
    loved: 1,
    fresh: 1,
  });
  const object = layout.objects.find(
    ({ object: candidate }) =>
      candidate.id === options.config.camera.focusTargets.bookshelf.objectId
  )?.object;
  const booksByRow = {
    loved: bookshelf?.kind === "online" ? bookshelf.mostLoved : [],
    fresh: bookshelf?.kind === "online" ? bookshelf.newest : [],
  } satisfies { [key in BookshelfRowKey]: ShelfBookView[] };
  const description = describeBookshelf({
    state: bookshelf === undefined ? "loading" : bookshelf.kind,
    bookCount: booksByRow.loved.length,
    copy,
  });
  if (object === undefined) {
    const emptyRow = {
      label: "",
      page: 0,
      pageCount: 1,
      direction: 1 as const,
      spines: [],
    };
    const view: BookshelfView = {
      rows: { loved: emptyRow, fresh: emptyRow },
      pulled: undefined,
    };
    return { bookshelf, refresh, description, view, hitTargets: [] };
  }
  const rows = getBookshelfRows({
    position: object.position,
    size: object.size,
  });
  const shelves = BOOKSHELF_ROW_KEYS.map((key) => {
    const row = rows[key];
    const books = booksByRow[key];
    const bookPages = paginateBookshelfRow({
      bookIds: books.map((book) => book.id),
      width: row.x1 - row.x0,
    });
    const page = Math.min(pages[key], bookPages.length - 1);
    const pageBooks = (bookPages.at(page) ?? []).flatMap((id) =>
      books.filter((book) => book.id === id)
    );
    return { key, row, books: pageBooks, page, pageCount: bookPages.length };
  });
  function turnPage(key: BookshelfRowKey, step: 1 | -1) {
    setDirections((current) => ({ ...current, [key]: step }));
    setPages((current) => ({
      ...current,
      [key]: Math.max(0, current[key] + step),
    }));
  }
  const pulled = (() => {
    for (const shelf of shelves) {
      const book = shelf.books.find(
        (candidate) =>
          getBookshelfBookId({ row: shelf.key, bookId: candidate.id }) ===
          options.highlightedId
      );
      if (book !== undefined) return { row: shelf.key, bookId: book.id };
    }
    return undefined;
  })();
  const view: BookshelfView = {
    rows: {
      loved: toRowView(shelves[0]),
      fresh: toRowView(shelves[1]),
    },
    pulled,
  };
  function toRowView(shelf: (typeof shelves)[number]) {
    return {
      label: copy.bookshelf.holder({
        row: copy.bookshelf.rows[shelf.key].toLocaleUpperCase(copy.locale),
        page: shelf.page + 1,
        pageCount: shelf.pageCount,
      }),
      page: shelf.page,
      pageCount: shelf.pageCount,
      direction: directions[shelf.key],
      spines: shelf.books.map((book) => ({
        id: book.id,
        title: book.title,
        manual: book.source === "manual",
      })),
    };
  }
  const hitTargets = shelves.flatMap((shelf): BookshelfHitTarget[] => {
    const placements = getBookshelfBookPlacements({
      row: shelf.row,
      bookIds: shelf.books.map((book) => book.id),
    });
    const bookTargets = shelf.books.map((book, index) => ({
      id: getBookshelfBookId({ row: shelf.key, bookId: book.id }),
      ...getBookshelfBookOutline({
        book: placements[index],
        projection: layout.projection,
      }),
      label: copy.bookshelf.bookLabel({
        title: book.title,
        authors: book.authors,
        loves: copy.bookshelf.loves({ count: book.voteCount }),
      }),
      tooltip: copy.bookshelf.bookTooltip({
        title: book.title,
        authors: book.authors,
      }),
      onActivate: () => options.onOpenBook({ row: shelf.key, book }),
    }));
    const holder = getBookshelfLabelHolder({
      row: shelf.row,
      position: object.position,
      size: object.size,
    });
    const rowName = copy.bookshelf.rows[shelf.key];
    const tabs = [
      {
        side: "previous" as const,
        step: -1 as const,
        enabled: shelf.page > 0,
        label: copy.bookshelf.previousPage({ row: rowName }),
      },
      {
        side: "next" as const,
        step: 1 as const,
        enabled: shelf.page < shelf.pageCount - 1,
        label: copy.bookshelf.nextPage({ row: rowName }),
      },
    ].flatMap((tab) =>
      tab.enabled
        ? [
            {
              id: `bookshelf-${shelf.key}-${tab.side}`,
              ...getBookshelfFaceOutline({
                rect: holder[tab.side],
                y: holder.y + 0.012,
                projection: layout.projection,
              }),
              label: tab.label,
              tooltip: undefined,
              onActivate: () => turnPage(shelf.key, tab.step),
            },
          ]
        : []
    );
    return [...bookTargets, ...tabs];
  });
  return { bookshelf, refresh, description, view, hitTargets };
}
