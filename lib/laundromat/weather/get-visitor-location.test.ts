import assert from "node:assert/strict";
import { test } from "node:test";

import { getVisitorLocation } from "./get-visitor-location";

test("reads coordinates, the decoded city and the country", () => {
  const headers = new Headers({
    "x-vercel-ip-latitude": "1.2897",
    "x-vercel-ip-longitude": "103.8501",
    "x-vercel-ip-city": "S%C3%A3o%20Paulo",
    "x-vercel-ip-country": "BR",
  });
  assert.deepEqual(getVisitorLocation(headers), {
    latitude: 1.2897,
    longitude: 103.8501,
    city: "São Paulo",
    country: "BR",
  });
});

test("returns undefined without usable coordinates", () => {
  assert.equal(getVisitorLocation(new Headers()), undefined);
  assert.equal(
    getVisitorLocation(
      new Headers({
        "x-vercel-ip-latitude": "91",
        "x-vercel-ip-longitude": "10",
      })
    ),
    undefined
  );
});

test("drops a city that is not valid percent-encoding", () => {
  const location = getVisitorLocation(
    new Headers({
      "x-vercel-ip-latitude": "10",
      "x-vercel-ip-longitude": "10",
      "x-vercel-ip-city": "%E0%A4%A",
    })
  );
  assert.equal(location?.city, undefined);
});
