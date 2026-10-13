import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

import { parseHourOverride } from "@/lib/laundromat/parse-hour-override";
import type { RenderQuality } from "@/lib/laundromat/render-quality/render-quality";

import { useRenderQuality } from "./settings/use-render-quality";

const TICK_MS = { full: 1000, lite: 60_000 } satisfies {
  [quality in RenderQuality]: number;
};

function subscribeToVisibleTicks(options: {
  tickMs: number;
  onChange: () => void;
}) {
  let timeoutId: number | undefined;
  function scheduleNextTick() {
    timeoutId = window.setTimeout(
      () => {
        options.onChange();
        scheduleNextTick();
      },
      options.tickMs - (Date.now() % options.tickMs)
    );
  }
  function restartWhileVisible() {
    window.clearTimeout(timeoutId);
    if (document.visibilityState === "visible") scheduleNextTick();
  }
  function handleVisibilityChange() {
    restartWhileVisible();
    options.onChange();
  }
  restartWhileVisible();
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    window.clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function subscribeToVisibleSeconds(onChange: () => void) {
  return subscribeToVisibleTicks({ tickMs: TICK_MS.full, onChange });
}

function subscribeToVisibleMinutes(onChange: () => void) {
  return subscribeToVisibleTicks({ tickMs: TICK_MS.lite, onChange });
}

function subscribeToNothing() {
  return () => {};
}

function getEpochSeconds() {
  return Math.floor(Date.now() / 1000);
}

function getEpochMinutesInSeconds() {
  return Math.floor(Date.now() / TICK_MS.lite) * (TICK_MS.lite / 1000);
}

function getServerEpochSeconds() {
  return undefined;
}

function toLocalHour(epochSeconds: number) {
  const date = new Date(epochSeconds * 1000);
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/** Return the fractional local hour, ticking once a second while the tab is visible (once a minute at `lite` quality), or the dev-only `?hour=` override; `undefined` during server rendering. */
export function useSceneHour() {
  const searchParams = useSearchParams();
  const override =
    process.env.NODE_ENV === "development"
      ? parseHourOverride(searchParams.get("hour"))
      : undefined;
  const { quality } = useRenderQuality();
  const isLite = quality === "lite";
  const subscribe = isLite
    ? subscribeToVisibleMinutes
    : subscribeToVisibleSeconds;
  const epochSeconds = useSyncExternalStore(
    override === undefined ? subscribe : subscribeToNothing,
    isLite ? getEpochMinutesInSeconds : getEpochSeconds,
    getServerEpochSeconds
  );
  if (override !== undefined) return override;
  return epochSeconds === undefined ? undefined : toLocalHour(epochSeconds);
}
