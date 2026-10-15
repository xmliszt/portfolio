import assert from "node:assert/strict";
import { test } from "node:test";

import { parseWeatherBody } from "./parse-weather-body";

const reading = {
  condition: "snow",
  isDay: false,
  temperatureC: -2,
  highC: 1,
  lowC: -5,
  city: "Oslo",
  unit: "celsius",
};

test("reads a reading body", () => {
  assert.deepEqual(parseWeatherBody({ kind: "reading", ...reading }), reading);
  assert.deepEqual(
    parseWeatherBody({ kind: "reading", ...reading, city: undefined }),
    { ...reading, city: undefined }
  );
});

test("returns undefined for an unknown location or a malformed body", () => {
  assert.equal(parseWeatherBody({ kind: "unknown" }), undefined);
  assert.equal(
    parseWeatherBody({ kind: "reading", ...reading, condition: "hail" }),
    undefined
  );
  assert.equal(
    parseWeatherBody({ kind: "reading", ...reading, highC: "1" }),
    undefined
  );
  assert.equal(parseWeatherBody("reading"), undefined);
});
