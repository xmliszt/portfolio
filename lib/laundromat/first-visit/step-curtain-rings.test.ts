import assert from "node:assert/strict";
import { test } from "node:test";

import { stepCurtainRings } from "./step-curtain-rings";

const minGap = 0.1;
const maxGap = 0.25;
const stacked = [0, 0.1, 0.2, 0.3, 0.4, 0.5];

function pull(options: { from: number[]; to: number; steps: number }) {
  const start = options.from.at(-1)!;
  return Array.from({ length: options.steps }, (_, step) => {
    return start + ((options.to - start) * (step + 1)) / options.steps;
  }).reduce<number[][]>(
    (frames, leader) => [
      ...frames,
      stepCurtainRings({ rings: frames.at(-1)!, leader, minGap, maxGap }),
    ],
    [options.from]
  );
}

test("closing tugs each ring only once the fabric before it is taut, leading ring first", () => {
  const frames = pull({ from: stacked, to: 1.25, steps: 100 });
  const startFrame = stacked.map((ring, index) =>
    frames.findIndex((frame) => Math.abs(frame[index]! - ring) > 1e-9)
  );
  assert.equal(startFrame[0], -1, "the stacked ring never moves");
  assert.ok(
    startFrame
      .slice(1)
      .every((frame, index, all) => index === 0 || frame < all[index - 1]!),
    `start frames ${startFrame.join(",")}`
  );
  assert.deepEqual(
    frames.at(-1)!.map((ring) => Number(ring.toFixed(6))),
    [0, 0.25, 0.5, 0.75, 1, 1.25]
  );
});

test("opening bunches the folds next to the leading ring first", () => {
  const drawn = [0, 0.25, 0.5, 0.75, 1, 1.25];
  const frames = pull({ from: drawn, to: 0.5, steps: 100 });
  const halfway = frames[50]!;
  const gaps = halfway.slice(1).map((ring, index) => ring - halfway[index]!);
  assert.ok(gaps.at(-1)! <= gaps[0]!, `gaps ${gaps.join(",")}`);
  assert.ok(Math.abs(gaps.at(-1)! - minGap) < 1e-9);
  assert.deepEqual(
    frames.at(-1)!.map((ring) => Number(ring.toFixed(6))),
    stacked
  );
});

test("every gap stays between minGap and maxGap", () => {
  const frames = [
    ...pull({ from: stacked, to: 1.25, steps: 37 }),
    ...pull({ from: [0, 0.25, 0.5, 0.75, 1, 1.25], to: 0.5, steps: 23 }),
  ];
  frames.forEach((frame) =>
    frame.slice(1).forEach((ring, index) => {
      const gap = ring - frame[index]!;
      assert.ok(gap >= minGap - 1e-9 && gap <= maxGap + 1e-9, `gap ${gap}`);
    })
  );
});
