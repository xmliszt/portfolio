import assert from "node:assert/strict";
import { test } from "node:test";

import { readRequestIp } from "./read-request-ip";

test("takes the first forwarded address", () => {
  assert.equal(
    readRequestIp(
      new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1" })
    ),
    "203.0.113.7"
  );
});

test("falls back to x-real-ip, then unknown", () => {
  assert.equal(
    readRequestIp(new Headers({ "x-real-ip": "198.51.100.2" })),
    "198.51.100.2"
  );
  assert.equal(readRequestIp(new Headers()), "unknown");
});
