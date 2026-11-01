import assert from "node:assert/strict";
import { test } from "node:test";

import { summariseKeywordSeries } from "./summarise-keyword-series";

test("totals the last 7 days and compares them with the 7 before", () => {
  const values = [9, ...Array(7).fill(10), ...Array(7).fill(15)];
  assert.deepEqual(summariseKeywordSeries(values), {
    last7Total: 105,
    previous7Total: 70,
    change: 0.5,
  });
});

test("skips missing days in the totals and gives no change", () => {
  const values = [undefined, 4, 4, 4, 4, 4, 4, undefined, 2, 2, 2, 2, 2, 2];
  assert.deepEqual(summariseKeywordSeries(values), {
    last7Total: 12,
    previous7Total: 24,
    change: undefined,
  });
});

test("has no change without a previous week or when it was zero", () => {
  assert.deepEqual(summariseKeywordSeries([3, 4]), {
    last7Total: 7,
    previous7Total: undefined,
    change: undefined,
  });
  const zeros = [...Array(7).fill(0), ...Array(7).fill(5)];
  assert.equal(summariseKeywordSeries(zeros).change, undefined);
});

test("has no totals for an empty series", () => {
  assert.deepEqual(summariseKeywordSeries([]), {
    last7Total: undefined,
    previous7Total: undefined,
    change: undefined,
  });
});
