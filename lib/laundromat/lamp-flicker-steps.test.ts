import assert from "node:assert/strict";
import { test } from "node:test";

import { LAMP_FLICKER_MS, LAMP_FLICKER_STEPS } from "./lamp-flicker-steps";

test("the flicker starts dark, moves forward in time, and ends fully on", () => {
  assert.equal(LAMP_FLICKER_STEPS.at(0)?.level, 0);
  assert.equal(LAMP_FLICKER_STEPS.at(-1)?.level, 1);
  LAMP_FLICKER_STEPS.slice(1).forEach((step, index) =>
    assert.ok(
      step.atMs > LAMP_FLICKER_STEPS[index].atMs,
      `${step.atMs} comes after ${LAMP_FLICKER_STEPS[index].atMs}`
    )
  );
  assert.ok((LAMP_FLICKER_STEPS.at(-1)?.atMs ?? 0) < LAMP_FLICKER_MS);
});
