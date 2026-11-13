"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, keyBy } from "lodash";

import type { BookshelfView } from "@/app/laundromat/objects/scene-views";
import {
  BOOKSHELF_ROW_KEYS,
  type BookshelfRowKey,
} from "@/lib/laundromat/bookshelf/bookshelf-row";
import { describeBookshelf } from "@/lib/laundromat/bookshelf/describe-bookshelf";
import { getBookshelfBookHitOutline } from "@/lib/laundromat/bookshelf/get-bookshelf-book-hit-outline";
import { getBookshelfBookId } from "@/lib/laundromat/bookshelf/get-bookshelf-book-id";
import { getBookshelfBookPlacements } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import { getBookshelfFaceOutline } from "@/lib/laundromat/bookshelf/get-bookshelf-face-outline";
import { getBookshelfInnerX } from "@/lib/laundromat/bookshelf/get-bookshelf-inner-x";
import { getBookshelfLabelHolder } from "@/lib/laundromat/bookshelf/get-bookshelf-label-holder";
import { getBookshelfRows } from "@/lib/laundromat/bookshelf/get-bookshelf-rows";
import { getBookshelfTabId } from "@/lib/laundromat/bookshelf/get-bookshelf-tab-id";
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
  disabled: boolean;
  onActivate: () => void;
};

/** Return the bookshelf's data, its description, what the scene draws for it and the hit targets of its books and page tabs, keeping the page each shelf shows. */
export function useBookshelfScene(options: {
  layout: SceneLayout;
  config: SceneConfig;
  copy: LaundromatCopy;
  highlightedId: string | undefined;
  selected: { row: BookshelfRowKey; bookId: number } | undefined;
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
  const rowWidth =
    object === undefined
      ? 0
      : (() => {
          const rows = getBookshelfRows({
            position: object.position,
            size: object.size,
          });
          return rows.loved.x1 - rows.loved.x0;
        })();
  const selectedPage = (() => {
    if (options.selected === undefined) return undefined;
    const { row, bookId } = options.selected;
    const page = paginateBookshelfRow({
      bookIds: booksByRow[row].map((book) => book.id),
      width: rowWidth,
    }).findIndex((ids) => ids.includes(bookId));
    return page === -1 ? undefined : { row, page };
  })();
  const selectedRow = selectedPage?.row;
  const selectedIndex = selectedPage?.page;
  const selectedBookId = options.selected?.bookId;
  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  });
  useEffect(() => {
    if (selectedRow === undefined || selectedIndex === undefined) return;
    const shown = pagesRef.current[selectedRow];
    if (shown === selectedIndex) return;
    const step = selectedIndex > shown ? 1 : -1;
    setDirections((current) => ({ ...current, [selectedRow]: step }));
    setPages((current) => ({ ...current, [selectedRow]: selectedIndex }));
  }, [selectedRow, selectedIndex, selectedBookId]);
  const description = describeBookshelf({
    state: bookshelf === undefined ? "loading" : bookshelf.kind,
    bookCount: booksByRow.loved.length,
    copy,
  });
  if (object === undefined) {
    const emptyRow = {
      litTab: undefined,
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
    return {
      bookshelf,
      refresh,
      description,
      view,
      hitTargets: [],
      booksByRow,
    };
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
  function turnPage(turn: {
    key: BookshelfRowKey;
    step: 1 | -1;
    pageCount: number;
  }) {
    setDirections((current) => ({ ...current, [turn.key]: turn.step }));
    setPages((current) => ({
      ...current,
      [turn.key]: clamp(
        Math.min(current[turn.key], turn.pageCount - 1) + turn.step,
        0,
        turn.pageCount - 1
      ),
    }));
  }
  const pulled = (() => {
    if (options.selected !== undefined) return options.selected;
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
  const shelfByKey = keyBy(shelves, (shelf) => shelf.key);
  const view: BookshelfView = {
    rows: {
      loved: toRowView(shelfByKey.loved),
      fresh: toRowView(shelfByKey.fresh),
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
      litTab: (["previous", "next"] as const).find(
        (side) =>
          options.highlightedId ===
            getBookshelfTabId({ row: shelf.key, side }) &&
          (side === "previous"
            ? shelf.page > 0
            : shelf.page < shelf.pageCount - 1)
      ),
      spines: shelf.books.map((book) => ({
        id: book.id,
        title: book.title,
        manual: book.source === "manual",
      })),
    };
  }
  const innerX = getBookshelfInnerX({
    position: object.position,
    size: object.size,
  });
  const bookTargets = shelves.flatMap((shelf): BookshelfHitTarget[] => {
    const placements = getBookshelfBookPlacements({
      row: shelf.row,
      bookIds: shelf.books.map((book) => book.id),
    });
    return shelf.books.map((book, index) => ({
      id: getBookshelfBookId({ row: shelf.key, bookId: book.id }),
      ...getBookshelfBookHitOutline({
        book: placements[index],
        row: shelf.row,
        innerX,
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
      disabled: false,
      onActivate: () => options.onOpenBook({ row: shelf.key, book }),
    }));
  });
  // the label holders hang in front of the shelf below, so their tabs come last and win the click
  const tabTargets = shelves.flatMap((shelf): BookshelfHitTarget[] => {
    const holder = getBookshelfLabelHolder({
      row: shelf.row,
      position: object.position,
      size: object.size,
    });
    const rowName = copy.bookshelf.rows[shelf.key];
    return [
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
    ].map((tab) => ({
      id: getBookshelfTabId({ row: shelf.key, side: tab.side }),
      ...getBookshelfFaceOutline({
        rect: holder[tab.side],
        y: holder.y + 0.012,
        projection: layout.projection,
      }),
      label: tab.label,
      tooltip: undefined,
      disabled: !tab.enabled,
      onActivate: () =>
        turnPage({
          key: shelf.key,
          step: tab.step,
          pageCount: shelf.pageCount,
        }),
    }));
  });
  const hitTargets = [...bookTargets, ...tabTargets];
  return { bookshelf, refresh, description, view, hitTargets, booksByRow };
}
