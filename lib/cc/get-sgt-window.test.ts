import assert from "node:assert/strict";
import { test } from "node:test";

import { getSgtWindow } from "./get-sgt-window";

const NINE_AM = { startHour: 9, endHour: 10, strength: 1, label: "9 am ET" };

test("moves a New York window with US daylight saving time", () => {
  assert.deepEqual(
    getSgtWindow({
      window: NINE_AM,
      timeZone: "America/New_York",
      at: new Date("2026-07-15T04:00:00Z"),
    }),
    { startHour: 21, endHour: 22 }
  );
  assert.deepEqual(
    getSgtWindow({
      window: NINE_AM,
      timeZone: "America/New_York",
      at: new Date("2026-11-11T04:00:00Z"),
    }),
    { startHour: 22, endHour: 23 }
  );
});

test("puts the Product Hunt launch hour at 15:00 SGT in the US summer", () => {
  assert.deepEqual(
    getSgtWindow({
      window: { startHour: 0, endHour: 1, strength: 1, label: "launch" },
      timeZone: "America/Los_Angeles",
      at: new Date("2026-07-14T04:00:00Z"),
    }),
    { startHour: 15, endHour: 16 }
  );
});
