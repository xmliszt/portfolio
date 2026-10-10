import assert from "node:assert/strict";
import { test } from "node:test";

import type { ClockWall } from "./get-wall-clock-drawing";
import { getWallClockDrawing } from "./get-wall-clock-drawing";

const projection = { unit: 10, origin: { x: 100, y: 100 } };

const walls: ClockWall[] = ["back", "left"];

function draw(options: { wall: ClockWall; hour: number }) {
  return getWallClockDrawing({
    center: { x: 5, y: 0, z: 5 },
    radius: 1,
    projection,
    ...options,
  });
}

test("points both hands straight up at noon", () => {
  const drawing = draw({ wall: "back", hour: 12 });
  for (const hand of [drawing.hourHand, drawing.minuteHand]) {
    assert.ok(Math.abs(hand.to.x - drawing.center.x) < 1e-9);
    assert.ok(hand.to.y < drawing.center.y);
  }
});

test("points the hour hand right at three on either wall", () => {
  for (const wall of walls) {
    const drawing = draw({ wall, hour: 15 });
    assert.ok(drawing.hourHand.to.x > drawing.center.x, wall);
    assert.ok(drawing.minuteHand.to.y < drawing.center.y, wall);
  }
});

test("points the minute hand down at half past", () => {
  const drawing = draw({ wall: "back", hour: 9.5 });
  assert.ok(drawing.minuteHand.to.y > drawing.center.y);
  assert.ok(drawing.hourHand.to.x < drawing.center.x);
});

test("draws a closed rim and twelve ticks", () => {
  const drawing = draw({ wall: "back", hour: 0 });
  assert.equal(drawing.ticks.length, 12);
  assert.ok(drawing.rim.length >= 24);
});
