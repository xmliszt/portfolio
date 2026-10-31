import assert from "node:assert/strict";
import { test } from "node:test";

import { GUIDE_FADE_SECONDS } from "./guide-fade-seconds";
import { GUIDE_STEPS_PER_SECOND } from "./guide-steps-per-second";
import { GUIDE_TAKES } from "./guide-takes";
import { runGuideTake } from "./run-guide-take";

for (const [name, take] of Object.entries(GUIDE_TAKES)) {
  test(`the ${name} take covers its loop and fade, from clock 0`, () => {
    const frames = runGuideTake(take);
    assert.equal(
      frames.length,
      Math.round(
        (take.loopSeconds + GUIDE_FADE_SECONDS) * GUIDE_STEPS_PER_SECOND
      ) + 1
    );
    assert.equal(frames.at(0)?.time, 0);
  });

  test(`the ${name} take plays the same every run`, () => {
    assert.deepEqual(
      runGuideTake(take).at(-1)?.cats,
      runGuideTake(take).at(-1)?.cats
    );
  });
}
