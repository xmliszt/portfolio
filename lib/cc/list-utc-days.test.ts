import assert from "node:assert/strict";
import { test } from "node:test";

import { listUtcDays } from "./list-utc-days";

test("lists the days before today in UTC, oldest first", () => {
  assert.deepEqual(
    listUtcDays({ now: new Date("2026-11-01T23:30:00+08:00"), count: 3 }),
    ["2026-10-29", "2026-10-30", "2026-10-31"]
  );
});

test("crosses a month end", () => {
  assert.deepEqual(
    listUtcDays({ now: new Date("2026-03-02T01:00:00Z"), count: 2 }),
    ["2026-02-28", "2026-03-01"]
  );
});
