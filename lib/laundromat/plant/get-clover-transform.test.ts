import assert from "node:assert/strict";
import { test } from "node:test";

import { getCloverTransform } from "./get-clover-transform";

const SPRITE_SIZE_PX = 24;
const CLOVER_SIZE_PX = 21.3;

test("a clover draws at its CSS size times the pixel ratio", () => {
  [1, 1.5, 2].forEach((pixelRatio) => {
    const matrix = getCloverTransform({
      x: 100,
      y: 50,
      rotation: 0.7,
      flip: 1,
      spriteScale: CLOVER_SIZE_PX / SPRITE_SIZE_PX,
      pixelRatio,
    });
    const drawnWidthPx =
      Math.hypot(matrix.a, matrix.b) * SPRITE_SIZE_PX * pixelRatio;
    assert.ok(Math.abs(drawnWidthPx - CLOVER_SIZE_PX * pixelRatio) < 1e-9);
    assert.deepEqual(
      { e: matrix.e, f: matrix.f },
      { e: 100 * pixelRatio, f: 50 * pixelRatio }
    );
  });
});

test("a flip of -1 mirrors the clover's y axis", () => {
  const base = { x: 0, y: 0, rotation: 0.3, spriteScale: 1, pixelRatio: 1 };
  const upright = getCloverTransform({ ...base, flip: 1 });
  const flipped = getCloverTransform({ ...base, flip: -1 });
  assert.deepEqual(
    { c: flipped.c, d: flipped.d },
    { c: -upright.c, d: -upright.d }
  );
  assert.deepEqual(
    { a: flipped.a, b: flipped.b },
    { a: upright.a, b: upright.b }
  );
});
