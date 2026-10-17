import assert from "node:assert/strict";
import { test } from "node:test";

import type { TouchStreak } from "./advance-touch-streak";
import { advanceTouchStreak } from "./advance-touch-streak";

test("advanceTouchStreak starts at 1 without a previous touch", () => {
  assert.deepEqual(
    advanceTouchStreak({ previous: undefined, nowMs: 500, windowMs: 2000 }),
    { count: 1, atMs: 500 }
  );
});

test("advanceTouchStreak chains touches that each land inside the window of the last one", () => {
  const streak = [0, 1900, 3800, 5800].reduce<TouchStreak | undefined>(
    (previous, nowMs) =>
      advanceTouchStreak({ previous, nowMs, windowMs: 2000 }),
    undefined
  );
  assert.deepEqual(streak, { count: 4, atMs: 5800 });
});

test("advanceTouchStreak resets to 1 once the window has passed", () => {
  assert.deepEqual(
    advanceTouchStreak({
      previous: { count: 9, atMs: 1000 },
      nowMs: 3001,
      windowMs: 2000,
    }),
    { count: 1, atMs: 3001 }
  );
});
