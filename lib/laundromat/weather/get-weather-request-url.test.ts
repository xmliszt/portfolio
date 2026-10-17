import assert from "node:assert/strict";
import { test } from "node:test";

import { getRequestedLocation } from "./get-requested-location";
import { getWeatherRequestUrl } from "./get-weather-request-url";

test("asks for the visitor's IP location without a place", () => {
  assert.equal(getWeatherRequestUrl(undefined), "/laundromat/weather");
});

test("asks for a chosen place in a query the route reads back", () => {
  const url = new URL(
    getWeatherRequestUrl({
      name: "Reykjavík",
      region: undefined,
      country: "Iceland",
      countryCode: "IS",
      latitude: 64.13548,
      longitude: -21.89541,
    }),
    "https://laundro.cafe"
  );
  assert.equal(url.pathname, "/laundromat/weather");
  assert.deepEqual(getRequestedLocation(url.searchParams), {
    latitude: 64.14,
    longitude: -21.9,
    city: "Reykjavík",
    country: "IS",
  });
});
