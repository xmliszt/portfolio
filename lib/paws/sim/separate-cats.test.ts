import assert from "node:assert/strict";
import { test } from "node:test";

import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import { separateCats } from "./separate-cats";
import { stepWorld } from "./step-world";

const LOOK = {
  coat: "ginger",
  pattern: "tabby",
  belly: "cream",
  pads: "pink",
  size: "medium",
  fluff: "medium",
  tail: "medium",
  tailShape: "slim",
  ears: "medium",
} as const;

const buildWorldWithTwoCats = () => {
  const world = createWorld({ random: createSeededRandom({ seed: 4 }) });
  const players = [
    { userId: "a", look: LOOK },
    { userId: "b", look: LOOK },
  ];
  stepWorld({ world, players, fingers: [], dtSeconds: 0.016 });
  const [a, b] = Object.values(world.cats);
  return { world, a, b };
};

test("pushes two walking cats apart equally until they no longer overlap", () => {
  const { world, a, b } = buildWorldWithTwoCats();
  Object.assign(a, { state: "pause", rest: undefined, x: 500, y: 500 });
  Object.assign(b, { state: "pause", rest: undefined, x: 510, y: 500 });
  separateCats(world);
  const gap = Math.hypot(b.x - a.x, b.y - a.y);
  assert.ok(gap >= 72 * (a.build.scale + b.build.scale) - 1e-6);
  assert.ok(Math.abs(500 - a.x - (b.x - 510)) < 1e-6);
});

test("moves only the walking cat when the other is resting", () => {
  const { world, a, b } = buildWorldWithTwoCats();
  Object.assign(a, { state: "sit", rest: "sit", x: 500, y: 500 });
  Object.assign(b, { state: "pause", rest: undefined, x: 520, y: 500 });
  separateCats(world);
  assert.equal(a.x, 500);
  assert.ok(b.x > 520);
});
