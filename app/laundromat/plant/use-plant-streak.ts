"use client";

import { useRef, useState } from "react";

import { randomBetween } from "@/lib/laundromat/audio/sounds/random-between";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { TouchStreak } from "@/lib/laundromat/plant/advance-touch-streak";
import { advanceTouchStreak } from "@/lib/laundromat/plant/advance-touch-streak";

export type BlessingPop = {
  id: number;
  text: string;
  driftPx: number;
  liftPx: number;
  tiltDeg: number;
};

/** Track the plant's touch streak: the blessing labels on screen, the clover showers running, and the handlers that change them. */
export function usePlantStreak(options: {
  windowMs: number;
  cloverStreak: number;
  maxStreak: number;
  copy: LaundromatCopy;
}) {
  const streakRef = useRef<TouchStreak>(undefined);
  const [pops, setPops] = useState<BlessingPop[]>([]);
  const [showerIds, setShowerIds] = useState<number[]>([]);

  function touch() {
    const nowMs = performance.now();
    const streak = advanceTouchStreak({
      previous: streakRef.current,
      nowMs,
      windowMs: options.windowMs,
      maxCount: options.maxStreak,
    });
    streakRef.current = streak;
    const { blessings } = options.copy.plant;
    const pop = {
      id: nowMs,
      text: options.copy.plant.blessing({
        count: streak.count,
        word: blessings[(streak.count - 1) % blessings.length],
      }),
      driftPx: randomBetween({ min: -32, max: 32 }),
      liftPx: randomBetween({ min: 0, max: 16 }),
      tiltDeg: randomBetween({ min: -8, max: 8 }),
    };
    setPops((current) => [...current, pop]);
    if (
      streak.count < options.maxStreak &&
      streak.count % options.cloverStreak === 0
    ) {
      setShowerIds((current) => [...current, nowMs]);
    }
  }

  function removePop(id: number) {
    setPops((current) => current.filter((pop) => pop.id !== id));
  }

  return {
    pops,
    showerIds,
    touch,
    removePop,
    endShower: (id: number) =>
      setShowerIds((current) => current.filter((showerId) => showerId !== id)),
  };
}
