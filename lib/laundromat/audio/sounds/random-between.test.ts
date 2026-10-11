import assert from "node:assert/strict";
import { test } from "node:test";

import { randomBetween } from "./random-between";

test("randomBetween maps 0 to min and values near 1 to near max", () => {
  assert.equal(randomBetween({ min: 200, max: 400, random: () => 0 }), 200);
  assert.equal(randomBetween({ min: 200, max: 400, random: () => 0.5 }), 300);
  assert.ok(randomBetween({ min: 200, max: 400, random: () => 0.999 }) < 400);
});

test("randomBetween stays in range with the default random", () => {
  Array.from({ length: 200 }, () => randomBetween({ min: -1, max: 1 })).forEach(
    (value) => assert.ok(value >= -1 && value < 1, `${value} out of range`)
  );
});
