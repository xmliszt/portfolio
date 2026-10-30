import assert from "node:assert/strict";
import { test } from "node:test";

import { createRateGate } from "./create-rate-gate";

test("lets a sender through up to the rate and drops everything past it within the second", () => {
  const clock = { now: 0 };
  const gate = createRateGate({ maxPerSecond: 2, now: () => clock.now });
  assert.equal(gate.allow("a"), true);
  assert.equal(gate.allow("a"), true);
  assert.equal(gate.allow("a"), false);
  assert.equal(gate.allow("b"), true);
  clock.now = 1001;
  assert.equal(gate.allow("a"), true);
});

test("lets a flooding sender through at the rate", () => {
  const clock = { now: 0 };
  const gate = createRateGate({ maxPerSecond: 2, now: () => clock.now });
  const allowed = Array.from({ length: 20 }, (_, index) => {
    clock.now = index * 100;
    return gate.allow("a");
  });
  assert.deepEqual(allowed.slice(0, 12), [
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
  ]);
});
