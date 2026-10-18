import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyPlumePuffs } from "./get-toy-plume-puffs";
import { TOY_FLIGHT } from "./toy-flight-timeline";

const ORIGIN = { x: 0.15, y: 5.5, z: 0 };

test("puffs no gas while the car drives to the ramp", () => {
  assert.deepEqual(
    getToyPlumePuffs({
      elapsedMs: TOY_FLIGHT.launchMs / 2,
      origin: ORIGIN,
      spacingMs: 35,
    }),
    []
  );
});

test("keeps puffs above the base while the car sinks", () => {
  const puffs = getToyPlumePuffs({
    elapsedMs:
      TOY_FLIGHT.launchMs +
      TOY_FLIGHT.climbMs +
      TOY_FLIGHT.coastMs +
      TOY_FLIGHT.steadyMs +
      TOY_FLIGHT.descendMs / 2,
    origin: ORIGIN,
    spacingMs: 35,
  });
  assert.ok(puffs.length > 0);
  for (const puff of puffs) {
    assert.ok(puff.center.z > ORIGIN.z);
    assert.ok(puff.opacity > 0 && puff.opacity <= 1);
  }
});
