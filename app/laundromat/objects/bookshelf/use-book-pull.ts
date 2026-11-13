"use client";

import { useEffect, useRef, useState } from "react";
import { omit } from "lodash";
import {
  animate,
  type AnimationPlaybackControls,
  useReducedMotion,
} from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { BookshelfRowKey } from "@/lib/laundromat/bookshelf/bookshelf-row";

const PULL_S = 0.26;
const PULL_EASE = [0.2, 0.9, 0.3, 1.2] as const;

export type BookPull = {
  row: BookshelfRowKey;
  bookId: number;
  progress: number;
};

type PullEntry = {
  row: BookshelfRowKey;
  bookId: number;
  value: number;
  target: number;
  controls: AnimationPlaybackControls | undefined;
};

/** Return every book that is pulled out or easing back, with how far out it is, 0 to 1 (a little past 1 while it settles). */
export function useBookPull(
  pulled: { row: BookshelfRowKey; bookId: number } | undefined
) {
  const reducedMotion = useReducedMotion();
  const { quality } = useRenderQuality();
  const isCalm = reducedMotion === true || quality === "lite";
  const [pulls, setPulls] = useState<{ [key: string]: BookPull }>({});
  const entriesRef = useRef<{ [key: string]: PullEntry }>({});
  const pulledRow = pulled?.row;
  const pulledBookId = pulled?.bookId;

  useEffect(() => {
    const entries = entriesRef.current;
    const pulledKey =
      pulledRow === undefined || pulledBookId === undefined
        ? undefined
        : `${pulledRow}:${pulledBookId}`;
    if (
      pulledKey !== undefined &&
      pulledRow !== undefined &&
      pulledBookId !== undefined &&
      entries[pulledKey] === undefined
    ) {
      entries[pulledKey] = {
        row: pulledRow,
        bookId: pulledBookId,
        value: 0,
        target: 0,
        controls: undefined,
      };
    }
    for (const [key, entry] of Object.entries(entries)) {
      const target = key === pulledKey ? 1 : 0;
      if (entry.target === target && entry.controls !== undefined) continue;
      entry.target = target;
      entry.controls?.stop();
      entry.controls = animate(entry.value, target, {
        duration: isCalm ? 0 : PULL_S,
        ease: PULL_EASE,
        onUpdate: (value) => {
          entry.value = value;
          setPulls((current) => ({
            ...current,
            [key]: { row: entry.row, bookId: entry.bookId, progress: value },
          }));
        },
        onComplete: () => {
          if (target !== 0) return;
          delete entries[key];
          setPulls((current) => omit(current, key));
        },
      });
    }
  }, [pulledRow, pulledBookId, isCalm]);

  useEffect(() => {
    const entries = entriesRef.current;
    return () => {
      for (const entry of Object.values(entries)) entry.controls?.stop();
    };
  }, []);

  return Object.values(pulls);
}
