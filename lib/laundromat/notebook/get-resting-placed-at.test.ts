import assert from "node:assert/strict";
import { test } from "node:test";

import { getRestingPlacedAt } from "./get-resting-placed-at";

test("a save within the interval keeps the visitor resting", () => {
  assert.equal(
    getRestingPlacedAt({ stored: "1000", now: 1500, intervalMs: 1000 }),
    1000
  );
});

test("a save older than the interval is ignored", () => {
  assert.equal(
    getRestingPlacedAt({ stored: "1000", now: 2000, intervalMs: 1000 }),
    undefined
  );
});

test("nothing stored or an unreadable value is ignored", () => {
  assert.equal(
    getRestingPlacedAt({ stored: null, now: 0, intervalMs: 1000 }),
    undefined
  );
  assert.equal(
    getRestingPlacedAt({ stored: "soon", now: 0, intervalMs: 1000 }),
    undefined
  );
});

test("a save time later than now is ignored", () => {
  assert.equal(
    getRestingPlacedAt({ stored: "5000", now: 1000, intervalMs: 1000 }),
    undefined
  );
});
