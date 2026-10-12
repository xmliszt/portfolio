import { useCallback, useEffect, useState } from "react";

import { adoptNewerFlask } from "@/lib/laundromat/coffee/adopt-newer-flask";
import type { CoffeeEvent } from "@/lib/laundromat/coffee/coffee-state";
import { INITIAL_COFFEE_STATE } from "@/lib/laundromat/coffee/coffee-state";
import { getCoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import { transitionCoffee } from "@/lib/laundromat/coffee/transition-coffee";
import type { RemoteFlask } from "@/lib/laundromat/realtime/room-presence";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { transitionTv } from "@/lib/laundromat/tv/transition-tv";
import type { TvEvent, TvState } from "@/lib/laundromat/tv/tv-state";

const TICK_MS = 1000;
const MS_PER_MINUTE = 60_000;

export function useRoomAppliances(options: {
  config: SceneConfig;
  visitorId: string | undefined;
}) {
  const { tv: tvDetails, coffee: coffeeDetails } = options.config.details;
  const [tv, setTv] = useState<TvState>({
    on: false,
    station: 0,
    volumePercent: tvDetails.defaultVolumePercent,
  });
  const [coffeeState, setCoffeeState] = useState(INITIAL_COFFEE_STATE);
  const [now, setNow] = useState(() => Date.now());
  const { flaskPortions } = coffeeDetails;
  const timing = {
    flaskPortions,
    brewMs: coffeeDetails.brewSeconds * 1000,
    hotMs: coffeeDetails.hotMinutes * MS_PER_MINUTE,
  };
  const coffee = getCoffeePhase({
    flask: coffeeState.flask,
    now,
    timing,
    ownVisitorId: options.visitorId,
  });
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
      transitionCoffee({
        state: current,
        event,
        now: at,
        timing,
        visitorId: options.visitorId,
      })
    );
  }

  const adoptFlasks = useCallback(
    (others: RemoteFlask[]) => {
      setCoffeeState((current) => {
        const flask = adoptNewerFlask({
          flask: current.flask,
          others,
          maxPortions: flaskPortions,
        });
        return flask === current.flask ? current : { ...current, flask };
      });
    },
    [flaskPortions]
  );

  const resetFlask = useCallback(() => {
    setCoffeeState((current) => ({
      ...current,
      flask: INITIAL_COFFEE_STATE.flask,
    }));
  }, []);

  return {
    tv,
    coffee,
    cup,
    flask: coffeeState.flask,
    isCupSteaming,
    dispatchTv,
    dispatchCoffee,
    adoptFlasks,
    resetFlask,
  };
}
