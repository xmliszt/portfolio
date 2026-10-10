import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";

import { parseHourOverride } from "@/lib/laundromat/parse-hour-override";

const TICK_MS = 1000;

function subscribeToVisibleSeconds(onChange: () => void) {
  let intervalId: number | undefined;
  function restartWhileVisible() {
    window.clearInterval(intervalId);
    if (document.visibilityState !== "visible") return;
    intervalId = window.setInterval(onChange, TICK_MS);
  }
  function handleVisibilityChange() {
    restartWhileVisible();
    onChange();
  }
  restartWhileVisible();
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function subscribeToNothing() {
  return () => {};
}

function getEpochSeconds() {
  return Math.floor(Date.now() / 1000);
}

function getServerEpochSeconds() {
  return undefined;
}

function toLocalHour(epochSeconds: number) {
  const date = new Date(epochSeconds * 1000);
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/** Return the fractional local hour, ticking once a second while the tab is visible, or the dev-only `?hour=` override; `undefined` during server rendering. */
export function useSceneHour() {
  const searchParams = useSearchParams();
  const override =
    process.env.NODE_ENV === "development"
      ? parseHourOverride(searchParams.get("hour"))
      : undefined;
  const epochSeconds = useSyncExternalStore(
    override === undefined ? subscribeToVisibleSeconds : subscribeToNothing,
    getEpochSeconds,
    getServerEpochSeconds
  );
  if (override !== undefined) return override;
  return epochSeconds === undefined ? undefined : toLocalHour(epochSeconds);
}
