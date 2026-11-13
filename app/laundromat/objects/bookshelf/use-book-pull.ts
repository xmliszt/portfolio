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

type PullEntry = {
  value: number;
  target: number;
  controls: AnimationPlaybackControls | undefined;
};

/** Return the key `row:bookId` of every book that is pulled out or easing back, mapped to how far out it is, 0 to 1 (a little past 1 while it settles). */
export function useBookPull(
  pulled: { row: BookshelfRowKey; bookId: number } | undefined
) {
  const reducedMotion = useReducedMotion();
  const { quality } = useRenderQuality();
  const isCalm = reducedMotion === true || quality === "lite";
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const entriesRef = useRef<{ [key: string]: PullEntry }>({});
  const pulledKey =
    pulled === undefined ? undefined : `${pulled.row}:${pulled.bookId}`;

  useEffect(() => {
    const entries = entriesRef.current;
    const keys = [
      ...Object.keys(entries),
      ...(pulledKey !== undefined && entries[pulledKey] === undefined
        ? [pulledKey]
        : []),
    ];
    for (const key of keys) {
      const entry = entries[key] ?? {
        value: 0,
        target: 0,
        controls: undefined,
      };
      entries[key] = entry;
      const target = key === pulledKey ? 1 : 0;
      if (entry.target === target && entry.controls !== undefined) continue;
      entry.target = target;
      entry.controls?.stop();
      entry.controls = animate(entry.value, target, {
        duration: isCalm ? 0 : PULL_S,
        ease: PULL_EASE,
        onUpdate: (value) => {
          entry.value = value;
          setProgress((current) => ({ ...current, [key]: value }));
        },
        onComplete: () => {
          if (target !== 0) return;
          delete entries[key];
          setProgress((current) => omit(current, key));
        },
      });
    }
  }, [pulledKey, isCalm]);

  useEffect(() => {
    const entries = entriesRef.current;
    return () => {
      for (const entry of Object.values(entries)) entry.controls?.stop();
    };
  }, []);

  return progress;
}
