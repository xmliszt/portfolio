import assert from "node:assert/strict";
import { test } from "node:test";

import { jitter } from "./jitter";

test("jitter spans value ± amount", () => {
  assert.equal(jitter({ value: 1000, amount: 0.1, random: () => 0 }), 900);
  assert.equal(jitter({ value: 1000, amount: 0.1, random: () => 0.5 }), 1000);
  assert.ok(
    Math.abs(jitter({ value: 1000, amount: 0.1, random: () => 0.75 }) - 1050) <
      1e-9
  );
});

test("jitter with amount 0 returns value unchanged", () => {
  assert.equal(jitter({ value: 440, amount: 0, random: () => 0.9 }), 440);
});
