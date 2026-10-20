import assert from "node:assert/strict";
import { test } from "node:test";

import { planJarLoad } from "./plan-jar-load";

const now = 100_000;
const minGapMs = 5000;

test("loads at once when nothing has loaded yet or the gap has passed", () => {
  assert.deepEqual(
    planJarLoad({
      state: { isLoading: false, isQueued: false },
      now,
      minGapMs,
    }),
    { kind: "load" }
  );
  assert.deepEqual(
    planJarLoad({
      state: { isLoading: false, isQueued: false, loadedAt: now - minGapMs },
      now,
      minGapMs,
    }),
    { kind: "load" }
  );
});

test("keeps a request made while a load is in flight for after it", () => {
  assert.deepEqual(
    planJarLoad({ state: { isLoading: true, isQueued: false }, now, minGapMs }),
    { kind: "after-load" }
  );
});

test("waits out the gap after a recent load, and drops repeats once queued", () => {
  assert.deepEqual(
    planJarLoad({
      state: { isLoading: false, isQueued: false, loadedAt: now - 1000 },
      now,
      minGapMs,
    }),
    { kind: "later", afterMs: 4000 }
  );
  assert.deepEqual(
    planJarLoad({
      state: { isLoading: true, isQueued: true, loadedAt: now - 1000 },
      now,
      minGapMs,
    }),
    { kind: "skip" }
  );
});
