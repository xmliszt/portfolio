import assert from "node:assert/strict";
import { test } from "node:test";

import { getPuddleRadius } from "./get-puddle-radius";

const outline = (spill: { x: number; y: number; seconds: number }) =>
  Array.from({ length: 24 }, (_, i) =>
    getPuddleRadius({ spill, angle: (i / 24) * Math.PI * 2 })
  );

test("each spill spot gives its own puddle shape, the same every time", () => {
  const first = outline({ x: 300, y: 400, seconds: 20 });
  const second = outline({ x: 900, y: 650, seconds: 20 });
  assert.deepEqual(first, outline({ x: 300, y: 400, seconds: 20 }));
  const difference = first.reduce(
    (sum, reach, i) => sum + Math.abs(reach - second[i]),
    0
  );
  assert.ok(difference / first.length > 5, `shapes differ by ${difference}`);
});

test("a puddle spreads, then dries to nothing", () => {
  const spill = { x: 300, y: 400, seconds: 0 };
  assert.equal(getPuddleRadius({ spill, angle: 1 }), 0);
  assert.ok(
    getPuddleRadius({ spill: { ...spill, seconds: 20 }, angle: 1 }) > 10
  );
  assert.equal(
    getPuddleRadius({ spill: { ...spill, seconds: 1e4 }, angle: 1 }),
    0
  );
});
