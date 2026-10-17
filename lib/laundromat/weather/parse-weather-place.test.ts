import assert from "node:assert/strict";
import { test } from "node:test";

import { parseWeatherPlace } from "./parse-weather-place";

test("reads a full place", () => {
  const place = {
    name: "Lisbon",
    region: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    latitude: 38.72,
    longitude: -9.13,
  };
  assert.deepEqual(parseWeatherPlace(place), place);
});

test("leaves missing or empty optional fields undefined", () => {
  assert.deepEqual(
    parseWeatherPlace({
      name: "Nuuk",
      region: "",
      latitude: 64.18,
      longitude: -51.72,
    }),
    {
      name: "Nuuk",
      region: undefined,
      country: undefined,
      countryCode: undefined,
      latitude: 64.18,
      longitude: -51.72,
    }
  );
});

test("refuses a place without a name or usable coordinates", () => {
  assert.equal(parseWeatherPlace(null), undefined);
  assert.equal(parseWeatherPlace({ latitude: 1, longitude: 1 }), undefined);
  assert.equal(
    parseWeatherPlace({ name: "Nowhere", latitude: 95, longitude: 1 }),
    undefined
  );
  assert.equal(
    parseWeatherPlace({ name: "Nowhere", latitude: "1", longitude: 1 }),
    undefined
  );
});
