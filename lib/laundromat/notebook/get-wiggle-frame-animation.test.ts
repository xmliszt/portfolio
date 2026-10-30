import assert from "node:assert/strict";
import { test } from "node:test";

import { getWiggleFrameAnimation } from "./get-wiggle-frame-animation";
import { getWiggleKeyframes } from "./get-wiggle-keyframes";

test("starts each frame one slot after the previous within a shared cycle", () => {
  assert.deepEqual(
    [0, 1, 2].map((frame) =>
      getWiggleFrameAnimation({ frame, frameCount: 3, fps: 4 })
    ),
    [
      "lm-doodle-wiggle 0.75s step-end infinite -0.75s",
      "lm-doodle-wiggle 0.75s step-end infinite -0.5s",
      "lm-doodle-wiggle 0.75s step-end infinite -0.25s",
    ]
  );
});

test("keeps a frame visible for one slot of the cycle", () => {
  assert.equal(
    getWiggleKeyframes(4),
    "@keyframes lm-doodle-wiggle { 0% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }"
  );
});
