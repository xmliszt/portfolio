import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyBoxClosingFrame } from "./get-toy-box-closing-frame";
import { getToyBoxOpeningFrame } from "./get-toy-box-opening-frame";

test("reduced-motion packing fully closes a half-open box before its departure fade", () => {
  const opening = getToyBoxOpeningFrame({
    elapsedMs: 250,
    lidFallMs: 700,
    boxFadeMs: 500,
    reducedMotion: true,
  });
  const options = { opening, lidFallMs: 700, boxFadeMs: 500, durationMs: 400 };
  assert.deepEqual(
    getToyBoxClosingFrame({ ...options, elapsedMs: 0 }),
    opening
  );
  assert.deepEqual(getToyBoxClosingFrame({ ...options, elapsedMs: 400 }), {
    setOpacity: 0,
    lidAngleDeg: 0,
  });
});

test("packing closes the lid before launch even with slower lab timings", () => {
  const opening = getToyBoxOpeningFrame({
    elapsedMs: 1500,
    lidFallMs: 3000,
    boxFadeMs: 3000,
    reducedMotion: false,
  });
  assert.ok(opening.lidAngleDeg > 0);
  assert.deepEqual(
    getToyBoxClosingFrame({
      opening,
      elapsedMs: 2150,
      lidFallMs: 3000,
      boxFadeMs: 3000,
      durationMs: 2150,
    }),
    { setOpacity: 0, lidAngleDeg: 0 }
  );
});
