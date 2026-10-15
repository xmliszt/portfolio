import assert from "node:assert/strict";
import { test } from "node:test";

import { isAirPurifierRunning } from "./is-air-purifier-running";

test("runs from the threshold up and stays off below it or without a reading", () => {
  assert.equal(isAirPurifierRunning({ aqi: 101, minAqi: 101 }), true);
  assert.equal(isAirPurifierRunning({ aqi: 171, minAqi: 101 }), true);
  assert.equal(isAirPurifierRunning({ aqi: 100, minAqi: 101 }), false);
  assert.equal(isAirPurifierRunning({ aqi: undefined, minAqi: 101 }), false);
});
