import assert from "node:assert/strict";
import { test } from "node:test";

import { sgtToUtc } from "./sgt-to-utc";

test("converts a Singapore date and time to UTC", () => {
  assert.equal(
    sgtToUtc({ date: "2026-11-03", time: "16:01" }).toISOString(),
    "2026-11-03T08:01:00.000Z"
  );
});

test("crosses into the previous UTC day before 08:00 Singapore time", () => {
  assert.equal(
    sgtToUtc({ date: "2026-11-03", time: "02:00" }).toISOString(),
    "2026-11-02T18:00:00.000Z"
  );
  assert.equal(
    sgtToUtc({ date: "2027-01-01", time: "00:00" }).toISOString(),
    "2026-12-31T16:00:00.000Z"
  );
});
