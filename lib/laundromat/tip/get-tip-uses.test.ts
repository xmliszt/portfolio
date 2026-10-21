import assert from "node:assert/strict";
import { test } from "node:test";

import { getTipUses } from "./get-tip-uses";

test("gives each coin its tier's uses", () => {
  assert.deepEqual([100, 200, 500, 1000].map(getTipUses), [1, 2, 6, 15]);
});

test("gives a custom amount the tier of the largest coin it reaches", () => {
  assert.equal(getTipUses(199), 1);
  assert.equal(getTipUses(499), 2);
  assert.equal(getTipUses(700), 6);
  assert.equal(getTipUses(999), 6);
  assert.equal(getTipUses(50000), 15);
});
