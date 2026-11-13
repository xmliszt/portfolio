"use client";

import { useCallback, useEffect, useState } from "react";

import type { BookshelfResult } from "./bookshelf-actions";
import { loadBookshelf } from "./bookshelf-actions";

function loadOrOffline() {
  return loadBookshelf().catch((): BookshelfResult => ({ kind: "offline" }));
}

/** Return the bookshelf as last loaded from the database (`undefined` until the first load) and `refresh` to load it again. */
export function useBookshelf() {
  const [bookshelf, setBookshelf] = useState<BookshelfResult>();

  const refresh = useCallback(async () => {
    const next = await loadOrOffline();
    setBookshelf((current) =>
      next.kind === "offline" && current?.kind === "online" ? current : next
    );
    return next;
  }, []);

  useEffect(() => {
    let isCancelled = false;
    loadOrOffline().then((next) => {
      if (!isCancelled) setBookshelf(next);
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  return { bookshelf, refresh };
}
