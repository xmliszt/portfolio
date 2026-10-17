"use client";

import { useRef, useState } from "react";

import { randomBetween } from "@/lib/laundromat/audio/sounds/random-between";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { TouchStreak } from "@/lib/laundromat/plant/advance-touch-streak";
import { advanceTouchStreak } from "@/lib/laundromat/plant/advance-touch-streak";
import { getStreakReward } from "@/lib/laundromat/plant/get-streak-reward";

export type BlessingPop = {
  id: number;
  text: string;
  anchor: { x: number; y: number };
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
  const nextIdRef = useRef(1);
  const [pops, setPops] = useState<BlessingPop[]>([]);
  const [showerIds, setShowerIds] = useState<number[]>([]);

  function touch(touchOptions: { anchor: { x: number; y: number } }) {
    const streak = advanceTouchStreak({
      previous: streakRef.current,
      nowMs: performance.now(),
      windowMs: options.windowMs,
      maxCount: options.maxStreak,
    });
    streakRef.current = streak;
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    const reward = getStreakReward({
      count: streak.count,
      cloverStreak: options.cloverStreak,
      maxStreak: options.maxStreak,
      blessings: options.copy.plant.blessings,
    });
    const pop = {
      id,
      text: options.copy.plant.blessing({
        count: streak.count,
        word: reward.word,
      }),
      anchor: touchOptions.anchor,
      driftPx: randomBetween({ min: -32, max: 32 }),
      liftPx: randomBetween({ min: 0, max: 16 }),
      tiltDeg: randomBetween({ min: -8, max: 8 }),
    };
    setPops((current) => [...current, pop]);
    if (reward.isShower) setShowerIds((current) => [...current, id]);
  }

  function removePop(id: number) {
    setPops((current) => current.filter((pop) => pop.id !== id));
  }

  function endShower(id: number) {
    setShowerIds((current) => current.filter((showerId) => showerId !== id));
  }

  return { pops, showerIds, touch, removePop, endShower };
}
