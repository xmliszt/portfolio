import assert from "node:assert/strict";
import { test } from "node:test";

import { getClockHandAngles } from "./get-clock-hand-angles";

test("points both hands up at noon and midnight", () => {
  assert.deepEqual(getClockHandAngles(0), { hourDeg: 0, minuteDeg: 0 });
  assert.deepEqual(getClockHandAngles(12), { hourDeg: 0, minuteDeg: 0 });
});

test("uses a twelve-hour dial", () => {
  assert.deepEqual(getClockHandAngles(15), { hourDeg: 90, minuteDeg: 0 });
  assert.deepEqual(getClockHandAngles(21), { hourDeg: 270, minuteDeg: 0 });
});

test("moves the minute hand continuously and carries it into the hour hand", () => {
  assert.deepEqual(getClockHandAngles(9.5), { hourDeg: 285, minuteDeg: 180 });
  const angles = getClockHandAngles(10 + 15.5 / 60);
  assert.ok(Math.abs(angles.minuteDeg - 93) < 1e-9);
  assert.ok(Math.abs(angles.hourDeg - (300 + 15.5 / 2)) < 1e-9);
});
