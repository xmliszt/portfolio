import assert from "node:assert/strict";
import { test } from "node:test";

import { parseOpenMeteoForecast } from "./parse-open-meteo-forecast";

function buildForecast(options: { weatherCode: number; isDay: number }) {
  return {
    current: {
      time: "2026-10-15T14:00",
      temperature_2m: 27.4,
      weather_code: options.weatherCode,
      is_day: options.isDay,
    },
    daily: {
      time: ["2026-10-15"],
      temperature_2m_max: [31.2],
      temperature_2m_min: [25.1],
    },
  };
}

test("reads the current weather and today's high and low", () => {
  assert.deepEqual(
    parseOpenMeteoForecast(buildForecast({ weatherCode: 61, isDay: 1 })),
    {
      condition: "rain",
      isDay: true,
      temperatureC: 27.4,
      highC: 31.2,
      lowC: 25.1,
    }
  );
  assert.equal(
    parseOpenMeteoForecast(buildForecast({ weatherCode: 0, isDay: 0 }))?.isDay,
    false
  );
});

test("returns undefined for a malformed body or an unknown code", () => {
  assert.equal(parseOpenMeteoForecast({ error: true }), undefined);
  assert.equal(parseOpenMeteoForecast(null), undefined);
  assert.equal(
    parseOpenMeteoForecast(buildForecast({ weatherCode: 4, isDay: 1 })),
    undefined
  );
});
