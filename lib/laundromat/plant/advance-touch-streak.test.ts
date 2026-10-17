import assert from "node:assert/strict";
import { test } from "node:test";

import type { TouchStreak } from "./advance-touch-streak";
import { advanceTouchStreak } from "./advance-touch-streak";

test("the first touch starts a streak of 1", () => {
  assert.deepEqual(
    advanceTouchStreak({
      previous: undefined,
      nowMs: 500,
      windowMs: 2000,
      maxCount: 99,
    }),
    { count: 1, atMs: 500 }
  );
});

test("touches that each land within the window of the last one chain", () => {
  const streak = [0, 1900, 3800, 5800].reduce<TouchStreak | undefined>(
    (previous, nowMs) =>
      advanceTouchStreak({ previous, nowMs, windowMs: 2000, maxCount: 99 }),
    undefined
  );
  assert.deepEqual(streak, { count: 4, atMs: 5800 });
});

test("a touch after the window has passed starts over at 1", () => {
  assert.deepEqual(
    advanceTouchStreak({
      previous: { count: 9, atMs: 1000 },
      nowMs: 3001,
      windowMs: 2000,
      maxCount: 99,
    }),
    { count: 1, atMs: 3001 }
  );
});

test("the streak stops counting at maxCount", () => {
  assert.deepEqual(
    advanceTouchStreak({
      previous: { count: 99, atMs: 1000 },
      nowMs: 1500,
      windowMs: 2000,
      maxCount: 99,
    }),
    { count: 99, atMs: 1500 }
  );
});
