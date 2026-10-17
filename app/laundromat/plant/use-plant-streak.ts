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

/** Track the plant's touch streak: the blessing labels on screen, whether the clover shower is running, and the handlers that change them. */
export function usePlantStreak(options: {
  windowMs: number;
  cloverStreak: number;
  copy: LaundromatCopy;
}) {
  const streakRef = useRef<TouchStreak>(undefined);
  const [pops, setPops] = useState<BlessingPop[]>([]);
  const [isShowering, setIsShowering] = useState(false);

  function touch() {
    const nowMs = performance.now();
    const streak = advanceTouchStreak({
      previous: streakRef.current,
      nowMs,
      windowMs: options.windowMs,
    });
    streakRef.current = streak;
    const { blessings } = options.copy.plant;
    const pop = {
      id: nowMs,
      text: options.copy.plant.blessing({
        count: streak.count,
        word: blessings[(streak.count - 1) % blessings.length],
      }),
      driftPx: randomBetween({ min: -40, max: 40 }),
      liftPx: randomBetween({ min: 24, max: 56 }),
      tiltDeg: randomBetween({ min: -8, max: 8 }),
    };
    setPops((current) => [...current, pop]);
    if (streak.count === options.cloverStreak) setIsShowering(true);
  }

  function removePop(id: number) {
    setPops((current) => current.filter((pop) => pop.id !== id));
  }

  return {
    pops,
    isShowering,
    touch,
    removePop,
    endShower: () => setIsShowering(false),
  };
}
