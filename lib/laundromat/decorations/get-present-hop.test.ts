import assert from "node:assert/strict";
import { test } from "node:test";

import { getPresentHop } from "./get-present-hop";

test("a present jumps on a gravity arc, lands with a squash, bounces once and rests", () => {
  assert.deepEqual(getPresentHop({ elapsedMs: 0 }), {
    lift: 0,
    tiltDeg: 0,
    squash: 0,
  });
  assert.equal(getPresentHop({ elapsedMs: 210 }).lift, 1);
  const rising = getPresentHop({ elapsedMs: 105 }).lift;
  assert.ok(Math.abs(rising - 0.75) < 1e-9, `quarter-way lift is ${rising}`);
  assert.ok(getPresentHop({ elapsedMs: 460 }).squash > 0.13);
  assert.equal(getPresentHop({ elapsedMs: 460 }).lift, 0);
  const bounce = getPresentHop({ elapsedMs: 585 }).lift;
  assert.ok(bounce > 0.15 && bounce < 0.17, `bounce peak is ${bounce}`);
  assert.deepEqual(getPresentHop({ elapsedMs: 900 }), {
    lift: 0,
    tiltDeg: 0,
    squash: 0,
  });
});
