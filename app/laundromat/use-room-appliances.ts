import { useEffect, useState } from "react";

import type { CoffeeEvent } from "@/lib/laundromat/coffee/coffee-state";
import { INITIAL_COFFEE_STATE } from "@/lib/laundromat/coffee/coffee-state";
import { getCoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import { transitionCoffee } from "@/lib/laundromat/coffee/transition-coffee";
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
  const [coffeeState, setCoffeeState] = useState(INITIAL_COFFEE_STATE);
  const [now, setNow] = useState(() => Date.now());
  const timing = {
    flaskPortions: coffeeDetails.flaskPortions,
    brewMs: coffeeDetails.brewSeconds * 1000,
    hotMs: coffeeDetails.hotMinutes * MS_PER_MINUTE,
  };
  const coffee = getCoffeePhase({ state: coffeeState, now, timing });
  const { cup } = coffeeState;
  const isCupSteaming = cup.kind === "full" && now < cup.hotUntil;

  const isCoffeeChanging =
    coffee.kind === "brewing" ||
    (coffee.kind === "ready" && coffee.hot) ||
    isCupSteaming;
  useEffect(() => {
    if (!isCoffeeChanging) return;
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(interval);
  }, [isCoffeeChanging]);

  function dispatchTv(event: TvEvent) {
    setTv((current) =>
      transitionTv({ state: current, event, settings: tvDetails })
    );
  }

  function dispatchCoffee(event: CoffeeEvent) {
    const at = Date.now();
    setNow(at);
    setCoffeeState((current) =>
      transitionCoffee({ state: current, event, now: at, timing })
    );
  }

  return { tv, coffee, cup, isCupSteaming, dispatchTv, dispatchCoffee };
}
