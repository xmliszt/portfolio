import assert from "node:assert/strict";
import { test } from "node:test";

import { getStreakReward } from "./get-streak-reward";

const BLESSINGS = ["luck", "fortune", "calm"];

function rewardAt(count: number) {
  return getStreakReward({
    count,
    cloverStreak: 10,
    maxStreak: 99,
    blessings: BLESSINGS,
  });
}

test("a clover shower starts on every tenth touch", () => {
  assert.deepEqual(
    [9, 10, 11, 20, 90].map((count) => rewardAt(count).isShower),
    [false, true, false, true, true]
  );
});

test("the capped streak never starts another shower", () => {
  assert.equal(rewardAt(99).isShower, false);
});

test("blessing words cycle from the first word after the last one", () => {
  assert.deepEqual(
    [1, 2, 3, 4].map((count) => rewardAt(count).word),
    ["luck", "fortune", "calm", "luck"]
  );
});
