import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePlacesBody } from "./parse-places-body";

test("reads the places and skips malformed ones", () => {
  const lisbon = {
    name: "Lisbon",
    region: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    latitude: 38.72,
    longitude: -9.13,
  };
  assert.deepEqual(
    parsePlacesBody({ places: [lisbon, { name: "Nowhere" }, null] }),
    [lisbon]
  );
});

test("returns no places for a malformed body", () => {
  assert.deepEqual(parsePlacesBody({ places: "Lisbon" }), []);
  assert.deepEqual(parsePlacesBody(null), []);
});
