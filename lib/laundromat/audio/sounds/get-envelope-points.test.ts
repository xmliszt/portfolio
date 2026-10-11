import assert from "node:assert/strict";
import { test } from "node:test";

import { ENVELOPE_FLOOR, getEnvelopePoints } from "./get-envelope-points";

test("getEnvelopePoints places attack, hold and decay in seconds", () => {
  const points = getEnvelopePoints({
    startTimeS: 2,
    attackMs: 10,
    holdMs: 40,
    decayMs: 250,
    peak: 0.3,
  });
  assert.deepEqual(
    points.map((point) => point.ramp),
    ["set", "linear", "set", "exponential"]
  );
  const times = points.map((point) => point.timeS);
  [2, 2.01, 2.05, 2.3].forEach((expected, index) =>
    assert.ok(
      Math.abs((times.at(index) ?? NaN) - expected) < 1e-9,
      `point ${index} at ${times.at(index)}, expected ${expected}`
    )
  );
  assert.equal(points.at(1)?.value, 0.3);
  assert.equal(points.at(-1)?.value, ENVELOPE_FLOOR);
});

test("getEnvelopePoints never schedules a value below the floor", () => {
  const points = getEnvelopePoints({
    startTimeS: 0,
    attackMs: 1,
    decayMs: 5,
    peak: 0,
  });
  points.forEach((point) => assert.ok(point.value >= ENVELOPE_FLOOR));
  assert.equal(points.at(1)?.timeS, points.at(2)?.timeS);
});
