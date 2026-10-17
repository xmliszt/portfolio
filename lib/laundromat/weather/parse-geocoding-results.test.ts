import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGeocodingResults } from "./parse-geocoding-results";

test("maps each result to a place and skips unusable ones", () => {
  assert.deepEqual(
    parseGeocodingResults({
      results: [
        {
          id: 2267057,
          name: "Lisbon",
          latitude: 38.71667,
          longitude: -9.13333,
          country_code: "PT",
          admin1: "Lisbon",
          country: "Portugal",
        },
        { id: 1, name: "", latitude: 1, longitude: 1 },
        "Porto",
      ],
    }),
    [
      {
        name: "Lisbon",
        region: "Lisbon",
        country: "Portugal",
        countryCode: "PT",
        latitude: 38.71667,
        longitude: -9.13333,
      },
    ]
  );
});

test("returns no places when the body has no results", () => {
  assert.deepEqual(parseGeocodingResults({ generationtime_ms: 0.4 }), []);
  assert.deepEqual(parseGeocodingResults(undefined), []);
});
