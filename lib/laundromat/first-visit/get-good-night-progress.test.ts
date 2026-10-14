import assert from "node:assert/strict";
import { test } from "node:test";

import { getGoodNightProgress } from "./get-good-night-progress";

const TIMING = { trackMs: 10_000, landShare: 0.8, textMs: 1000 };

test("the drop starts at the top with no text", () => {
  assert.deepEqual(getGoodNightProgress({ elapsedMs: 0, ...TIMING }), {
    drop: 0,
    text: 0,
  });
});

test("the drop falls fastest first and slows into place", () => {
  const quarter = getGoodNightProgress({ elapsedMs: 2000, ...TIMING }).drop;
  const half = getGoodNightProgress({ elapsedMs: 4000, ...TIMING }).drop;
  const threeQuarters = getGoodNightProgress({
    elapsedMs: 6000,
    ...TIMING,
  }).drop;
  assert.ok(quarter > 0.25 && half > 0.5 && threeQuarters > 0.75);
  assert.ok(half - quarter > threeQuarters - half);
});

test("the text fades in only after the drop lands", () => {
  assert.deepEqual(getGoodNightProgress({ elapsedMs: 8000, ...TIMING }), {
    drop: 1,
    text: 0,
  });
  assert.equal(getGoodNightProgress({ elapsedMs: 8500, ...TIMING }).text, 0.5);
  assert.deepEqual(getGoodNightProgress({ elapsedMs: 60_000, ...TIMING }), {
    drop: 1,
    text: 1,
  });
});
