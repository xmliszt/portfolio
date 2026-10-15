"use client";

import { useEffect, useState } from "react";

import { randomBetween } from "@/lib/laundromat/audio/sounds/random-between";

const MIN_GAP_MS = 7_000;
const MAX_GAP_MS = 24_000;

/** Return how many times lightning has struck so far, striking every `MIN_GAP_MS` to `MAX_GAP_MS` while `isStorming` and the tab is visible. */
export function useLightningStrikes(isStorming: boolean) {
  const [strikes, setStrikes] = useState(0);

  useEffect(() => {
    if (!isStorming) return;
    const state: { timer?: number } = {};
    function scheduleNext() {
      state.timer = window.setTimeout(
        () => {
          if (document.visibilityState === "visible") {
            setStrikes((count) => count + 1);
          }
          scheduleNext();
        },
        randomBetween({ min: MIN_GAP_MS, max: MAX_GAP_MS })
      );
    }
    scheduleNext();
    return () => window.clearTimeout(state.timer);
  }, [isStorming]);

  return strikes;
}
