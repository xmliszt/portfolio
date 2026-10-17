import assert from "node:assert/strict";
import { test } from "node:test";

import { getRequestedLocation } from "./get-requested-location";

test("reads coordinates, city and country from the query", () => {
  assert.deepEqual(
    getRequestedLocation(
      new URLSearchParams({
        latitude: "35.69",
        longitude: "139.69",
        city: "Tokyo",
        country: "JP",
      })
    ),
    { latitude: 35.69, longitude: 139.69, city: "Tokyo", country: "JP" }
  );
});

test("leaves city and country undefined when the query has none", () => {
  assert.deepEqual(
    getRequestedLocation(
      new URLSearchParams({ latitude: "1", longitude: "2" })
    ),
    { latitude: 1, longitude: 2, city: undefined, country: undefined }
  );
});

test("returns undefined without usable coordinates", () => {
  assert.equal(getRequestedLocation(new URLSearchParams()), undefined);
  assert.equal(
    getRequestedLocation(
      new URLSearchParams({ latitude: "10", longitude: "181" })
    ),
    undefined
  );
});
