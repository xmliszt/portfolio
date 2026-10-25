import { useEffect, useState } from "react";

import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { advanceToyBox } from "@/lib/laundromat/toy/advance-toy-box";
import { getToyBoxDate } from "@/lib/laundromat/toy/get-toy-box-date";
import { getToyBoxWindow } from "@/lib/laundromat/toy/get-toy-box-window";
import type { ToyBoxState } from "@/lib/laundromat/toy/toy-box-view";
import { TOY_FLIGHT } from "@/lib/laundromat/toy/toy-flight-timeline";
import { TOY_STILL_POSES } from "@/lib/laundromat/toy/toy-still-poses";

export function useToyBox(options: {
  details: SceneConfig["details"]["toyBox"];
  reducedMotion: boolean;
  hourOverride?: number;
}) {
  const [state, setState] = useState<ToyBoxState>({
    windowStartedAtMs: undefined,
    openingStartedAtMs: undefined,
    view: { kind: "hidden" },
  });
  const openingMs =
    (options.reducedMotion ? 0 : options.details.lidFallMs) +
    options.details.boxFadeMs;
  const reducedMotion = options.reducedMotion;
  const { hourOverride } = options;
  const tickMs = ["arriving", "opening", "departing"].includes(state.view.kind)
    ? 100
    : 1000;

  useEffect(() => {
    let timeoutId: number | undefined;
    function synchronize() {
      window.clearTimeout(timeoutId);
      const now = getToyBoxDate({ now: new Date(), hourOverride });
      setState((previous) =>
        advanceToyBox({
          state: previous,
          now,
          nowMs: performance.now(),
          openingMs,
          reducedMotion,
          visible: document.visibilityState === "visible",
        })
      );
      if (document.visibilityState === "visible") {
        timeoutId = window.setTimeout(
          synchronize,
          tickMs - (now.getTime() % tickMs)
        );
      }
    }
    synchronize();
    document.addEventListener("visibilitychange", synchronize);
    window.addEventListener("focus", synchronize);
    window.addEventListener("pageshow", synchronize);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", synchronize);
      window.removeEventListener("focus", synchronize);
      window.removeEventListener("pageshow", synchronize);
    };
  }, [openingMs, reducedMotion, tickMs, hourOverride]);

  function open() {
    const now = getToyBoxDate({ now: new Date(), hourOverride });
    const window = getToyBoxWindow(now);
    if (!window.active) return;
    setState((previous) =>
      previous.view.kind === "closed" &&
      previous.windowStartedAtMs === window.startMs
        ? {
            ...previous,
            openingStartedAtMs: performance.now(),
            view: { kind: "opening" },
          }
        : previous
    );
  }

  function play() {
    const window = getToyBoxWindow(
      getToyBoxDate({ now: new Date(), hourOverride })
    );
    if (!window.active) return;
    const runMs = reducedMotion ? TOY_STILL_POSES.totalMs : TOY_FLIGHT.totalMs;
    const nowMs = performance.now();
    setState((previous) =>
      previous.view.kind === "open" &&
      previous.windowStartedAtMs === window.startMs &&
      nowMs - previous.view.runStartedAtMs >= runMs
        ? { ...previous, view: { kind: "open", runStartedAtMs: nowMs } }
        : previous
    );
  }

  return {
    view: state.view,
    paused: state.suspendedAtMs !== undefined,
    open,
    play,
  };
}
