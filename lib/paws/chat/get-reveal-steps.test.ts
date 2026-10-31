import assert from "node:assert/strict";
import { test } from "node:test";

import { getRevealSteps } from "./get-reveal-steps";

const cat = {
  voice: { age: "adult", voice: "soft", mood: "chatty" },
  size: "medium",
  userId: "u",
} as const;

test("shows one more character as each syllable starts, then the whole line", () => {
  const steps = getRevealSteps({ ...cat, text: "hi yo" });
  assert.deepEqual(
    steps.map((step) => step.characters),
    [1, 2, 3, 4, 5, 5]
  );
  assert.ok(
    steps.every(
      (step, index) => index === 0 || step.atMs >= steps[index - 1].atMs
    )
  );
});

test("shows a line longer than the babble in full when the babble ends", () => {
  const text = "a".repeat(60);
  assert.equal(getRevealSteps({ ...cat, text }).at(-1)?.characters, 60);
});
