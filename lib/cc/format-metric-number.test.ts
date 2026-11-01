import assert from "node:assert/strict";
import { test } from "node:test";

import { formatMetricNumber } from "./format-metric-number";

test("adds thousands separators", () => {
  assert.equal(formatMetricNumber(1240), "1,240");
  assert.equal(formatMetricNumber(18420), "18,420");
  assert.equal(formatMetricNumber(12), "12");
  assert.equal(formatMetricNumber(0), "0");
});

test("prints a dash for a missing value", () => {
  assert.equal(formatMetricNumber(undefined), "—");
});
