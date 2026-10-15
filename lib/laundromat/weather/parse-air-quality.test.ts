import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAirQuality } from "./parse-air-quality";

test("reads the current US AQI as a whole number", () => {
  assert.equal(parseAirQuality({ current: { us_aqi: 41.6 } }), 42);
  assert.equal(parseAirQuality({ current: { us_aqi: 0 } }), 0);
});

test("returns undefined for a missing or malformed reading", () => {
  assert.equal(parseAirQuality({ current: { us_aqi: null } }), undefined);
  assert.equal(parseAirQuality({ current: {} }), undefined);
  assert.equal(parseAirQuality({ error: true }), undefined);
  assert.equal(parseAirQuality(null), undefined);
});
