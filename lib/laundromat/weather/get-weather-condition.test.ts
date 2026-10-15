import assert from "node:assert/strict";
import { test } from "node:test";

import { getWeatherCondition } from "./get-weather-condition";

test("groups WMO codes into the panel's six conditions", () => {
  assert.equal(getWeatherCondition(0), "clear");
  assert.equal(getWeatherCondition(1), "clear");
  assert.equal(getWeatherCondition(3), "cloudy");
  assert.equal(getWeatherCondition(48), "fog");
  assert.equal(getWeatherCondition(53), "rain");
  assert.equal(getWeatherCondition(81), "rain");
  assert.equal(getWeatherCondition(75), "snow");
  assert.equal(getWeatherCondition(86), "snow");
  assert.equal(getWeatherCondition(95), "thunder");
});

test("returns undefined for codes outside the WMO table", () => {
  assert.equal(getWeatherCondition(4), undefined);
  assert.equal(getWeatherCondition(100), undefined);
});
