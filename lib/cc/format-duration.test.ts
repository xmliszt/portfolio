import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDuration } from "./format-duration";

const MINUTE_MS = 60_000;

test("keeps the two largest units", () => {
  assert.equal(formatDuration(12 * MINUTE_MS), "12 min");
  assert.equal(formatDuration(185 * MINUTE_MS), "3 h 5 min");
  assert.equal(formatDuration(180 * MINUTE_MS), "3 h");
  assert.equal(
    formatDuration((2 * 24 * 60 + 4 * 60 + 30) * MINUTE_MS),
    "2 d 4 h"
  );
  assert.equal(formatDuration(3 * 24 * 60 * MINUTE_MS), "3 d");
});

test("rounds anything under a minute up to 1 min", () => {
  assert.equal(formatDuration(0), "1 min");
  assert.equal(formatDuration(20_000), "1 min");
});
