import assert from "node:assert/strict";
import { test } from "node:test";

import { getGeocodingUrl } from "./get-geocoding-url";

test("searches by name in the base language", () => {
  const url = new URL(
    getGeocodingUrl({ query: "são paulo", language: "pt-br" })
  );
  assert.equal(url.origin, "https://geocoding-api.open-meteo.com");
  assert.equal(url.searchParams.get("name"), "são paulo");
  assert.equal(url.searchParams.get("language"), "pt");
  assert.equal(url.searchParams.get("count"), "6");
});
