"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import { applyWeatherCondition } from "@/lib/laundromat/weather/apply-weather-condition";
import { getWeatherRequestUrl } from "@/lib/laundromat/weather/get-weather-request-url";
import { parseWeatherBody } from "@/lib/laundromat/weather/parse-weather-body";
import { parseWeatherOverride } from "@/lib/laundromat/weather/parse-weather-override";
import { parseWeatherPlace } from "@/lib/laundromat/weather/parse-weather-place";
import type { WeatherPlace } from "@/lib/laundromat/weather/weather-place";
import type {
  TemperatureUnit,
  WeatherCondition,
  WeatherReading,
} from "@/lib/laundromat/weather/weather-reading";
import { WEATHER_CONDITIONS } from "@/lib/laundromat/weather/weather-reading";

import { LocalWeatherContext } from "./local-weather-context";
import { useLightningStrikes } from "./use-lightning-strikes";

const REFRESH_INTERVAL_MS = 30 * 60_000;
const CHECK_INTERVAL_MS = 5 * 60_000;
const STORAGE_KEYS = {
  unit: "laundromat:temperature-unit",
  place: "laundromat:weather-place",
  condition: "laundromat:weather-condition",
};

type LocalWeatherProviderProps = {
  reading?: WeatherReading;
  children: React.ReactNode;
};

type FetchedReading = { url: string; reading: WeatherReading | undefined };

function readStored(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | undefined) {
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readStoredPlace() {
  try {
    return parseWeatherPlace(JSON.parse(readStored(STORAGE_KEYS.place) ?? ""));
  } catch {
    return undefined;
  }
}

/** Provide the weather at the visitor's chosen place, or where their IP address puts them, fetched on mount, whenever the place changes and again once `REFRESH_INTERVAL_MS` has passed since the last answer while the tab is visible, keeping the last reading for the same place when a later answer has none and showing none while the place's first answer is on its way, with the visitor's chosen sky laid over it; the given `reading` or dev-only `?weather=` override replaces all of it. Also provide the temperature unit, the visitor's remembered choice or else the one usual at the place; the city the IP address points to; and the count of lightning strikes during a thunderstorm. */
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
  const [fetched, setFetched] = useState<FetchedReading>();
  const [liveCity, setLiveCity] = useState<string>();
  const [storedUnit, setStoredUnit] = useState<TemperatureUnit>();
  const [place, setStoredPlace] = useState<WeatherPlace>();
  const [condition, setStoredCondition] = useState<WeatherCondition>();
  const [isRestored, setIsRestored] = useState(false);
  const requestUrl = getWeatherRequestUrl(place);
  const isLive = place === undefined;

  useLayoutEffect(() => {
    const unit = readStored(STORAGE_KEYS.unit);
    const storedCondition = readStored(STORAGE_KEYS.condition);
    setStoredUnit(
      unit === "celsius" || unit === "fahrenheit" ? unit : undefined
    );
    setStoredPlace(readStoredPlace());
    setStoredCondition(
      WEATHER_CONDITIONS.find((known) => known === storedCondition)
    );
    setIsRestored(true);
  }, []);

  useEffect(() => {
    if (isOverridden || !isRestored) return;
    const controller = new AbortController();
    let fetchedAt = 0;
    let isFetching = false;
    async function refresh() {
      if (document.visibilityState !== "visible" || isFetching) return;
      if (Date.now() - fetchedAt < REFRESH_INTERVAL_MS) return;
      isFetching = true;
      try {
        const response = await fetch(requestUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const reading = parseWeatherBody(await response.json());
        fetchedAt = Date.now();
        setFetched((previous) =>
          reading === undefined && previous?.url === requestUrl
            ? previous
            : { url: requestUrl, reading }
        );
        if (isLive && reading?.city !== undefined) setLiveCity(reading.city);
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
  }, [isOverridden, isRestored, requestUrl, isLive]);

  const setUnit = useCallback((next: TemperatureUnit) => {
    setStoredUnit(next);
    writeStored(STORAGE_KEYS.unit, next);
  }, []);

  const setPlace = useCallback((next: WeatherPlace | undefined) => {
    setStoredPlace(next);
    writeStored(
      STORAGE_KEYS.place,
      next === undefined ? undefined : JSON.stringify(next)
    );
  }, []);

  const setCondition = useCallback((next: WeatherCondition | undefined) => {
    setStoredCondition(next);
    writeStored(STORAGE_KEYS.condition, next);
  }, []);

  const source =
    override ?? applyWeatherCondition({ fetched, requestUrl, condition });
  const unit = storedUnit ?? source?.unit ?? "celsius";
  const lightningStrikes = useLightningStrikes(source?.condition === "thunder");
  const value = useMemo(
    () => ({
      reading: source === undefined ? undefined : { ...source, unit },
      unit,
      setUnit,
      place,
      setPlace,
      liveCity,
      condition,
      setCondition,
      lightningStrikes,
    }),
    [
      source,
      unit,
      setUnit,
      place,
      setPlace,
      liveCity,
      condition,
      setCondition,
      lightningStrikes,
    ]
  );
  return (
    <LocalWeatherContext.Provider value={value}>
      {props.children}
    </LocalWeatherContext.Provider>
  );
}
