import assert from "node:assert/strict";
import { test } from "node:test";

import { parseWeatherOverride } from "./parse-weather-override";

test("reads a condition, by day or by night", () => {
  assert.equal(parseWeatherOverride("rain")?.condition, "rain");
  assert.equal(parseWeatherOverride("rain")?.isDay, true);
  assert.equal(parseWeatherOverride("clear-night")?.condition, "clear");
  assert.equal(parseWeatherOverride("clear-night")?.isDay, false);
});

test("returns undefined for anything else", () => {
  assert.equal(parseWeatherOverride(null), undefined);
  assert.equal(parseWeatherOverride(""), undefined);
  assert.equal(parseWeatherOverride("hail"), undefined);
  assert.equal(parseWeatherOverride("-night"), undefined);
});
