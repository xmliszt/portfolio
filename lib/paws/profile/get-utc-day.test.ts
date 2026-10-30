import assert from "node:assert/strict";
import { test } from "node:test";

import { getUtcDay } from "./get-utc-day";

test("uses the UTC day, not the local one", () => {
  assert.equal(getUtcDay(new Date("2026-10-30T23:59:59.999Z")), "2026-10-30");
  assert.equal(getUtcDay(new Date("2026-10-31T00:00:00+08:00")), "2026-10-30");
});
