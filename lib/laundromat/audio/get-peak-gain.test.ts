import assert from "node:assert/strict";
import { test } from "node:test";

import { getPeakGain } from "./get-peak-gain";

test("scales the loudest sample of any channel to full scale", () => {
  assert.equal(
    getPeakGain([new Float32Array([0.1, -0.25]), new Float32Array([0.2])]),
    4
  );
});

test("leaves silence alone and caps the boost of near-silence", () => {
  assert.equal(getPeakGain([new Float32Array([0, 0])]), 1);
  assert.equal(getPeakGain([new Float32Array([0.001])]), 30);
});
