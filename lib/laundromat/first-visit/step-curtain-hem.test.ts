import assert from "node:assert/strict";
import { test } from "node:test";

import { stepCurtainHem } from "./step-curtain-hem";

const omega = (2 * Math.PI) / 1;
const dtS = 1 / 120;

function run(options: { seconds: number; target: number }) {
  return Array.from({ length: Math.round(options.seconds / dtS) }).reduce<
    { hem: number[]; velocity: number[] }[]
  >(
    (frames) => [
      ...frames,
      stepCurtainHem({
        ...frames.at(-1)!,
        rings: [options.target],
        dtS,
        omega,
        dampingRatio: 0.4,
      }),
    ],
    [{ hem: [0], velocity: [0] }]
  );
}

test("sways past the ring and settles within two seconds", () => {
  const frames = run({ seconds: 3, target: 1 });
  const peak = Math.max(...frames.map((frame) => frame.hem[0]!));
  assert.ok(peak > 1.05 && peak < 1.4, `overshoot to ${peak}`);
  const afterTwo = frames.slice(Math.round(2 / dtS));
  assert.ok(
    afterTwo.every((frame) => Math.abs(frame.hem[0]! - 1) < 0.03),
    "settled by 2 s"
  );
});
