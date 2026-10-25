import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyBoxOpeningFrame } from "./get-toy-box-opening-frame";

test("an interrupted lid fall has no visible set", () => {
  const frame = getToyBoxOpeningFrame({
    elapsedMs: 100,
    lidFallMs: 700,
    boxFadeMs: 500,
    reducedMotion: false,
  });
  assert.ok(frame.lidAngleDeg > 0 && frame.lidAngleDeg < 90);
  assert.equal(frame.setOpacity, 0);
});

test("an interrupted fade retains partially visible contents", () => {
  const frame = getToyBoxOpeningFrame({
    elapsedMs: 900,
    lidFallMs: 700,
    boxFadeMs: 500,
    reducedMotion: false,
  });
  assert.equal(frame.lidAngleDeg, 90);
  assert.ok(frame.setOpacity > 0 && frame.setOpacity < 1);
});

test("reduced motion fades contents without rotating the lid", () => {
  const frame = getToyBoxOpeningFrame({
    elapsedMs: 250,
    lidFallMs: 700,
    boxFadeMs: 500,
    reducedMotion: true,
  });
  assert.equal(frame.lidAngleDeg, 0);
  assert.ok(Math.abs(frame.setOpacity - 0.5) < 0.001);
});
