import assert from "node:assert/strict";
import { test } from "node:test";

import { getZoneOffsetHours } from "./get-zone-offset-hours";

test("follows US daylight saving time in New York", () => {
  assert.equal(
    getZoneOffsetHours({
      timeZone: "America/New_York",
      at: new Date("2026-07-15T13:00:00Z"),
    }),
    -4
  );
  assert.equal(
    getZoneOffsetHours({
      timeZone: "America/New_York",
      at: new Date("2026-11-10T14:00:00Z"),
    }),
    -5
  );
});

test("returns a fixed 8 for Singapore", () => {
  assert.equal(
    getZoneOffsetHours({
      timeZone: "Asia/Singapore",
      at: new Date("2026-07-15T13:00:30Z"),
    }),
    8
  );
});
