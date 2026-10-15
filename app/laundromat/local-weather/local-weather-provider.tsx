"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";
import { parseWeatherBody } from "@/lib/laundromat/weather/parse-weather-body";
import { parseWeatherOverride } from "@/lib/laundromat/weather/parse-weather-override";
import type {
  TemperatureUnit,
  WeatherReading,
} from "@/lib/laundromat/weather/weather-reading";

import { LocalWeatherContext } from "./local-weather-context";
import { useLightningStrikes } from "./use-lightning-strikes";

const REFRESH_INTERVAL_MS = 30 * 60_000;
const CHECK_INTERVAL_MS = 5 * 60_000;
const TEMPERATURE_UNIT_STORAGE_KEY = "laundromat:temperature-unit";

type LocalWeatherProviderProps = {
  reading?: WeatherReading;
  children: React.ReactNode;
};

function readStoredUnit(): TemperatureUnit | undefined {
  try {
    const stored = window.localStorage.getItem(TEMPERATURE_UNIT_STORAGE_KEY);
    return stored === "celsius" || stored === "fahrenheit" ? stored : undefined;
  } catch {
    return undefined;
  }
}

/** Provide the weather where the visitor is, fetched on mount and again once `REFRESH_INTERVAL_MS` has passed since the last answer while the tab is visible, keeping the last reading when a later answer has none, or the given `reading` or dev-only `?weather=` override in its place; the temperature unit, the visitor's remembered choice or else the one usual in their region; and the count of lightning strikes during a thunderstorm. */
export function LocalWeatherProvider(props: LocalWeatherProviderProps) {
  const searchParams = useSearchParams();
  const overrideValue =
    process.env.NODE_ENV === "development" ? searchParams.get("weather") : null;
  const urlOverride = useMemo(
    () => parseWeatherOverride(overrideValue),
    [overrideValue]
  );
  const override = props.reading ?? urlOverride;
  const isOverridden = override !== undefined;
  const [fetched, setFetched] = useState<WeatherReading>();
  const [storedUnit, setStoredUnit] = useState<TemperatureUnit>();

  useLayoutEffect(() => {
    setStoredUnit(readStoredUnit());
  }, []);

  useEffect(() => {
    if (isOverridden) return;
    const controller = new AbortController();
    let fetchedAt = 0;
    let isFetching = false;
    async function refresh() {
      if (document.visibilityState !== "visible" || isFetching) return;
      if (Date.now() - fetchedAt < REFRESH_INTERVAL_MS) return;
      isFetching = true;
      try {
        const response = await fetch(`${LAUNDROMAT_BASE_PATH}/weather`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const reading = parseWeatherBody(await response.json());
        fetchedAt = Date.now();
        setFetched((previous) => reading ?? previous);
      } catch {
        return;
      } finally {
        isFetching = false;
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [isOverridden]);

  const setUnit = useCallback((next: TemperatureUnit) => {
    setStoredUnit(next);
    try {
      window.localStorage.setItem(TEMPERATURE_UNIT_STORAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  const source = override ?? fetched;
  const unit = storedUnit ?? source?.unit ?? "celsius";
  const lightningStrikes = useLightningStrikes(source?.condition === "thunder");
  const value = useMemo(
    () => ({
      reading: source === undefined ? undefined : { ...source, unit },
      unit,
      setUnit,
      lightningStrikes,
    }),
    [source, unit, setUnit, lightningStrikes]
  );
  return (
    <LocalWeatherContext.Provider value={value}>
      {props.children}
    </LocalWeatherContext.Provider>
  );
}
