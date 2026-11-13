"use client";

import { useCallback, useEffect, useState } from "react";

import type { BookshelfResult } from "./bookshelf-actions";
import { loadBookshelf } from "./bookshelf-actions";

/** Return the bookshelf as last loaded from the database (`undefined` until the first load) and `refresh` to load it again. */
export function useBookshelf() {
  const [bookshelf, setBookshelf] = useState<BookshelfResult>();

  const refresh = useCallback(async () => {
    const next = await loadBookshelf().catch(
      (): BookshelfResult => ({ kind: "offline" })
    );
    setBookshelf(next);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    loadBookshelf()
      .catch((): BookshelfResult => ({ kind: "offline" }))
      .then((next) => {
        if (!isCancelled) setBookshelf(next);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  return { bookshelf, refresh };
}
