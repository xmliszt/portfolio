import assert from "node:assert/strict";
import { test } from "node:test";

import { getWeatherLoops } from "./get-weather-loops";

test("plays rain in rain and thunderstorms", () => {
  assert.deepEqual(getWeatherLoops("rain"), ["rain-outside"]);
  assert.deepEqual(getWeatherLoops("thunder"), ["rain-outside"]);
});

test("stays quiet in every other weather or with no reading", () => {
  for (const condition of [
    "clear",
    "cloudy",
    "snow",
    "fog",
    undefined,
  ] as const) {
    assert.deepEqual(getWeatherLoops(condition), []);
  }
});
