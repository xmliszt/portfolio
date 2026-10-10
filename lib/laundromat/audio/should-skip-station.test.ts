import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldSkipStation } from "./should-skip-station";

test("skips to the next station until every station has failed", () => {
  assert.equal(shouldSkipStation({ failedStreak: 1, stationCount: 5 }), true);
  assert.equal(shouldSkipStation({ failedStreak: 4, stationCount: 5 }), true);
  assert.equal(shouldSkipStation({ failedStreak: 5, stationCount: 5 }), false);
});

test("never skips with a single station", () => {
  assert.equal(shouldSkipStation({ failedStreak: 1, stationCount: 1 }), false);
});
