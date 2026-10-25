import { useCallback, useEffect, useRef, useState } from "react";

import { adoptNewerFlask } from "@/lib/laundromat/coffee/adopt-newer-flask";
import type { CoffeeEvent } from "@/lib/laundromat/coffee/coffee-state";
import { INITIAL_COFFEE_STATE } from "@/lib/laundromat/coffee/coffee-state";
import { getFlaskClockOffsetMs } from "@/lib/laundromat/coffee/get-flask-clock-offset-ms";
import { getSharedCoffeePhase } from "@/lib/laundromat/coffee/get-shared-coffee-phase";
import { transitionCoffee } from "@/lib/laundromat/coffee/transition-coffee";
import type { RemoteFlask } from "@/lib/laundromat/realtime/room-presence";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { useRoomTv } from "./use-room-tv";

const TICK_MS = 1000;
const MS_PER_MINUTE = 60_000;

export function useRoomAppliances(options: {
  config: SceneConfig;
  visitorId: string | undefined;
}) {
  const { tv: tvDetails, coffee: coffeeDetails } = options.config.details;
  const roomTv = useRoomTv(tvDetails);
  const [coffeeState, setCoffeeState] = useState(INITIAL_COFFEE_STATE);
  const [now, setNow] = useState(() => Date.now());
  const [clockOffsetsMs, setClockOffsetsMs] = useState<{
    [visitorId: string]: number;
  }>({});
  const { flaskPortions } = coffeeDetails;
  const timing = {
    flaskPortions,
    brewMs: coffeeDetails.brewSeconds * 1000,
    hotMs: coffeeDetails.hotMinutes * MS_PER_MINUTE,
  };
  const coffee = getSharedCoffeePhase({
    flask: coffeeState.flask,
    now,
    timing,
    ownVisitorId: options.visitorId,
    clockOffsetsMs,
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

  function dispatchCoffee(event: CoffeeEvent) {
    const at = Date.now();
    setNow(at);
    setCoffeeState((current) =>
      transitionCoffee({
        state: current,
        event,
        now: at,
        flaskNow:
          at -
          getFlaskClockOffsetMs({
            flask: current.flask,
            ownVisitorId: options.visitorId,
            clockOffsetsMs,
          }),
        timing,
        visitorId: options.visitorId,
      })
    );
  }

  const flaskRef = useRef(coffeeState.flask);
  useEffect(() => {
    flaskRef.current = coffeeState.flask;
  }, [coffeeState.flask]);

  const adoptFlasks = useCallback(
    (others: RemoteFlask[]) => {
      const adopted = adoptNewerFlask({
        flask: flaskRef.current,
        others,
        maxPortions: flaskPortions,
      });
      if (adopted === flaskRef.current) return;
      setNow(Date.now());
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
    ...roomTv,
    coffee,
    cup,
    flask: coffeeState.flask,
    isCupSteaming,
    dispatchCoffee,
    adoptFlasks,
    resetFlask,
    setClockOffsetsMs,
  };
}
