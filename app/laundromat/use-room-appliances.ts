import { useEffect, useState } from "react";

import { getCoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { transitionTv } from "@/lib/laundromat/tv/transition-tv";
import type { TvEvent, TvState } from "@/lib/laundromat/tv/tv-state";

const TICK_MS = 1000;
const MS_PER_MINUTE = 60_000;

export function useRoomAppliances(config: SceneConfig) {
  const { tv: tvDetails, coffee: coffeeDetails } = config.details;
  const [tv, setTv] = useState<TvState>({
    on: false,
    station: 0,
    volumePercent: tvDetails.defaultVolumePercent,
  });
  const [brewStartedAt, setBrewStartedAt] = useState<number>();
  const [now, setNow] = useState(() => Date.now());
  const coffee = getCoffeePhase({
    brewStartedAt,
    now,
    brewMs: coffeeDetails.brewSeconds * 1000,
    hotMs: coffeeDetails.hotMinutes * MS_PER_MINUTE,
  });

  const isCoffeeIdle = coffee.kind === "idle";
  useEffect(() => {
    if (isCoffeeIdle) return;
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(interval);
  }, [isCoffeeIdle]);

  function dispatchTv(event: TvEvent) {
    setTv((current) =>
      transitionTv({ state: current, event, settings: tvDetails })
    );
  }

  function brew() {
    const startedAt = Date.now();
    setNow(startedAt);
    setBrewStartedAt(startedAt);
  }

  return { tv, coffee, dispatchTv, brew };
}
