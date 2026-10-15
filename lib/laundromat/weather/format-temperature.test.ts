import assert from "node:assert/strict";
import { test } from "node:test";

import { formatTemperature } from "./format-temperature";

test("rounds to whole degrees in the visitor's unit", () => {
  assert.equal(formatTemperature({ celsius: 18.6, unit: "celsius" }), "19°");
  assert.equal(formatTemperature({ celsius: 20, unit: "fahrenheit" }), "68°");
  assert.equal(formatTemperature({ celsius: -0.3, unit: "celsius" }), "0°");
});
