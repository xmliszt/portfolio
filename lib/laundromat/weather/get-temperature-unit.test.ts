import assert from "node:assert/strict";
import { test } from "node:test";

import { getTemperatureUnit } from "./get-temperature-unit";

test("reads Fahrenheit for the US and Celsius elsewhere", () => {
  assert.equal(getTemperatureUnit("US"), "fahrenheit");
  assert.equal(getTemperatureUnit("us"), "fahrenheit");
  assert.equal(getTemperatureUnit("SG"), "celsius");
  assert.equal(getTemperatureUnit(undefined), "celsius");
});
