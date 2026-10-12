import assert from "node:assert/strict";
import { test } from "node:test";

import { getNextTrackAt } from "./get-next-track-at";

test("an update under the limit goes out now", () => {
  assert.equal(
    getNextTrackAt({ sentAts: [1, 2], now: 10, limit: 3, windowMs: 100 }),
    10
  );
});

test("an update at the limit waits until the oldest one leaves the window", () => {
  assert.equal(
    getNextTrackAt({ sentAts: [5, 1, 2], now: 10, limit: 3, windowMs: 100 }),
    101
  );
});

test("updates older than the window do not count", () => {
  assert.equal(
    getNextTrackAt({ sentAts: [1, 2, 50], now: 110, limit: 3, windowMs: 100 }),
    110
  );
});

test("more past updates than the limit wait for enough of them to expire", () => {
  assert.equal(
    getNextTrackAt({ sentAts: [1, 2, 3, 4], now: 10, limit: 3, windowMs: 100 }),
    102
  );
});
