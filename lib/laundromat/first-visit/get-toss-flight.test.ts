import assert from "node:assert/strict";
import { test } from "node:test";

import { bedroomConfig } from "./bedroom-config";
import { getTossFlight, PILE_SLOTS } from "./get-toss-flight";

const { motion } = bedroomConfig;
const mouth = { x: 600, y: 400 };

test("lands in the pile slot for its turn, above both ends of the arc", () => {
  const flight = getTossFlight({
    from: { x: 700, y: 550 },
    mouth,
    slotIndex: 1,
    drop: false,
    motion,
  });
  assert.equal(flight.dx, 600 + PILE_SLOTS[1].x - 700);
  assert.equal(flight.dy, 400 + PILE_SLOTS[1].y - 550);
  assert.ok(flight.peak < flight.dy);
  assert.ok(flight.peak < 0);
});

test("takes 520–780 ms depending on distance", () => {
  function durationFrom(x: number) {
    return getTossFlight({
      from: { x, y: 400 },
      mouth,
      slotIndex: 0,
      drop: false,
      motion,
    }).durationMs;
  }
  assert.equal(durationFrom(610), 520);
  assert.equal(durationFrom(1500), 780);
  const middle = durationFrom(800);
  assert.ok(middle > 520 && middle < 780, `${middle} ms`);
});

test("drops straight in with a small spin", () => {
  const thrown = getTossFlight({
    from: { x: 620, y: 420 },
    mouth,
    slotIndex: 2,
    drop: false,
    motion,
  });
  const dropped = getTossFlight({
    from: { x: 620, y: 420 },
    mouth,
    slotIndex: 2,
    drop: true,
    motion,
  });
  assert.equal(dropped.durationMs, motion.dropMs);
  assert.ok(Math.abs(dropped.spinDeg) < Math.abs(thrown.spinDeg));
  assert.ok(dropped.peak > thrown.peak);
});

test("keeps the last slot once the pile is full", () => {
  const flight = getTossFlight({
    from: mouth,
    mouth,
    slotIndex: 9,
    drop: true,
    motion,
  });
  assert.deepEqual(flight.slot, PILE_SLOTS[PILE_SLOTS.length - 1]);
});
