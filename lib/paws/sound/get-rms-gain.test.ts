import assert from "node:assert/strict";
import { test } from "node:test";

import { getRmsGain } from "./get-rms-gain";

test("scales a clip's RMS level to the target", () => {
  const gain = getRmsGain([new Float32Array([0.06, -0.06]), new Float32Array([0.06, -0.06])]);
  assert.ok(Math.abs(gain - 2) < 1e-6);
});

test("clamps very quiet and very loud clips", () => {
  assert.equal(getRmsGain([new Float32Array([0.001, -0.001])]), 4);
  assert.equal(getRmsGain([new Float32Array([1, -1])]), 0.25);
});

test("leaves silence and empty clips alone", () => {
  assert.equal(getRmsGain([new Float32Array([0, 0])]), 1);
  assert.equal(getRmsGain([]), 1);
});
