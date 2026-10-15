import assert from "node:assert/strict";
import { test } from "node:test";

import { getWindowWeather } from "./get-window-weather";
import { WEATHER_CONDITIONS } from "./weather-reading";

test("leaves a clear or unknown sky untouched", () => {
  assert.deepEqual(getWindowWeather(undefined), getWindowWeather("clear"));
  assert.equal(getWindowWeather("clear").sunlight, 1);
  assert.equal(getWindowWeather("clear").veil, undefined);
});

test("lets less sun in under heavier weather", () => {
  const sunlight = WEATHER_CONDITIONS.map(
    (condition) => getWindowWeather(condition).sunlight
  );
  sunlight.forEach((share) => assert.ok(share > 0 && share <= 1));
  assert.ok(
    getWindowWeather("thunder").sunlight < getWindowWeather("rain").sunlight
  );
  assert.ok(
    getWindowWeather("rain").sunlight < getWindowWeather("cloudy").sunlight
  );
});

test("rains in a thunderstorm and flashes only then", () => {
  assert.equal(getWindowWeather("thunder").particles, "rain");
  assert.deepEqual(
    WEATHER_CONDITIONS.filter(
      (condition) => getWindowWeather(condition).lightning
    ),
    ["thunder"]
  );
});
