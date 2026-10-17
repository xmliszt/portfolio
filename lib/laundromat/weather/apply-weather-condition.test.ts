import assert from "node:assert/strict";
import { test } from "node:test";

import { applyWeatherCondition } from "./apply-weather-condition";
import type { WeatherReading } from "./weather-reading";

const READING = {
  condition: "clear",
  isDay: false,
  temperatureC: 21,
  highC: 24,
  lowC: 15,
  city: "Tokyo",
  unit: "celsius",
  aqi: 82,
} satisfies WeatherReading;

test("lays the chosen sky over the reading and keeps the rest", () => {
  assert.deepEqual(
    applyWeatherCondition({
      fetched: { url: "/w?tokyo", reading: READING },
      requestUrl: "/w?tokyo",
      condition: "snow",
    }),
    { ...READING, condition: "snow" }
  );
});

test("keeps the reading's own sky when none is chosen", () => {
  assert.equal(
    applyWeatherCondition({
      fetched: { url: "/w", reading: READING },
      requestUrl: "/w",
      condition: undefined,
    }),
    READING
  );
});

test("shows nothing while the reading is for another place", () => {
  assert.equal(
    applyWeatherCondition({
      fetched: { url: "/w?tokyo", reading: READING },
      requestUrl: "/w?lisbon",
      condition: "rain",
    }),
    undefined
  );
});

test("shows nothing for a chosen sky without a reading", () => {
  assert.equal(
    applyWeatherCondition({
      fetched: { url: "/w", reading: undefined },
      requestUrl: "/w",
      condition: "rain",
    }),
    undefined
  );
});
