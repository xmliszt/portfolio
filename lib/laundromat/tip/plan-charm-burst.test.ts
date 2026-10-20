import assert from "node:assert/strict";
import { test } from "node:test";

import { CHARM_KINDS, planCharmBurst } from "./plan-charm-burst";

function sequence(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("fans a full burst out to both sides, staggered", () => {
  const burst = planCharmBurst({ tier: "full", random: sequence([0.99, 0.5]) });
  assert.equal(burst.length, 4);
  assert.ok((burst.at(0)?.dxPx ?? 0) < 0);
  assert.ok((burst.at(-1)?.dxPx ?? 0) > 0);
  assert.deepEqual(
    burst.map(({ delayMs }) => delayMs),
    [0, 90, 180, 270]
  );
});

test("keeps a lite burst to at most two charms of known kinds", () => {
  for (const value of [0, 0.3, 0.99]) {
    const burst = planCharmBurst({ tier: "lite", random: sequence([value]) });
    assert.ok(burst.length >= 1 && burst.length <= 2);
    assert.ok(burst.every(({ kind }) => CHARM_KINDS.includes(kind)));
  }
});
