import assert from "node:assert/strict";
import { test } from "node:test";

import { getSgtParts } from "./get-sgt-parts";

test("returns Singapore-time fields with Monday as weekday 0", () => {
  assert.deepEqual(getSgtParts(new Date("2026-11-02T00:30:00Z")), {
    year: 2026,
    month: 11,
    day: 2,
    weekday: 0,
    hour: 8,
    minute: 30,
  });
});

test("rolls into the next Singapore day after 16:00 UTC", () => {
  assert.deepEqual(getSgtParts(new Date("2026-11-07T16:05:00Z")), {
    year: 2026,
    month: 11,
    day: 8,
    weekday: 6,
    hour: 0,
    minute: 5,
  });
});
