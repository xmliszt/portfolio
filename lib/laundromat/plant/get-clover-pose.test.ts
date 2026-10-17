import assert from "node:assert/strict";
import { test } from "node:test";

import { createFallingClovers } from "./create-falling-clovers";
import { getCloverPose } from "./get-clover-pose";

function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

const VIEWPORT = { width: 1200, height: 800 };
const clovers = createFallingClovers({
  count: 40,
  viewport: VIEWPORT,
  shadeCount: 3,
  random: createSeededRandom(7),
});

test("a clover is hidden before it spawns and after it has fallen", () => {
  clovers.forEach((clover) => {
    const base = { clover, viewportHeight: VIEWPORT.height, gustPx: 0 };
    assert.equal(
      getCloverPose({ ...base, timeS: clover.delayS - 0.01, still: false }),
      undefined
    );
    assert.equal(
      getCloverPose({
        ...base,
        timeS: clover.delayS + clover.fallS + 0.01,
        still: false,
      }),
      undefined
    );
  });
});

test("each clover starts above the screen and ends below it", () => {
  clovers.forEach((clover) => {
    const base = {
      clover,
      viewportHeight: VIEWPORT.height,
      gustPx: 0,
      still: false,
    };
    const first = getCloverPose({ ...base, timeS: clover.delayS });
    const last = getCloverPose({
      ...base,
      timeS: clover.delayS + clover.fallS * 0.9999,
    });
    assert.ok(first !== undefined && first.y + clover.sizePx / 2 <= 0);
    assert.ok(
      last !== undefined && last.y - clover.sizePx / 2 >= VIEWPORT.height
    );
  });
});

test("a still clover stays in place and fades in and out", () => {
  clovers.forEach((clover) => {
    const base = {
      clover,
      viewportHeight: VIEWPORT.height,
      gustPx: 40,
      still: true,
    };
    const middle = getCloverPose({
      ...base,
      timeS: clover.delayS + clover.fallS / 2,
    });
    const edge = getCloverPose({ ...base, timeS: clover.delayS });
    assert.deepEqual(middle && { x: middle.x, y: middle.y }, {
      x: clover.x,
      y: clover.stillY,
    });
    assert.ok(edge !== undefined && edge.opacity < 0.01);
  });
});
