"use client";

import { useCallback, useEffect, useState } from "react";

import type { ShelfResult } from "./notebook-actions";
import { loadShelf } from "./notebook-actions";

/** Return the shelf as last loaded from the database (`undefined` until the first load) and `refresh` to load it again. */
export function useNotebookShelf() {
  const [shelf, setShelf] = useState<ShelfResult>();

  const refresh = useCallback(async () => {
    const next = await loadShelf().catch(
      (): ShelfResult => ({ kind: "offline" })
    );
    setShelf(next);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    loadShelf()
      .catch((): ShelfResult => ({ kind: "offline" }))
      .then((next) => {
        if (!isCancelled) setShelf(next);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  return { shelf, refresh };
}
