import assert from "node:assert/strict";
import { test } from "node:test";

import { sampleFingerPath } from "./sample-finger-path";

const samples = [
  { x: 0, y: 0, t: 0, pressed: false },
  { x: 10, y: 0, t: 100, pressed: false },
  { x: 20, y: 10, t: 200, pressed: true },
  { x: 30, y: 30, t: 300, pressed: true },
];

test("passes through every sample", () => {
  for (const sample of samples)
    assert.deepEqual(sampleFingerPath({ samples, t: sample.t }), {
      x: sample.x,
      y: sample.y,
      pressed: sample.pressed,
    });
});

test("curves between samples and keeps the earlier sample's press", () => {
  const point = sampleFingerPath({ samples, t: 150 });
  assert.ok(point !== undefined);
  assert.ok(point.x > 10 && point.x < 20, `x ${point.x}`);
  assert.ok(point.y > 0 && point.y < 10, `y ${point.y}`);
  assert.equal(point.pressed, false);
});

test("holds the ends outside the samples' span", () => {
  assert.deepEqual(sampleFingerPath({ samples, t: -50 }), {
    x: 0,
    y: 0,
    pressed: false,
  });
  assert.deepEqual(sampleFingerPath({ samples, t: 900 }), {
    x: 30,
    y: 30,
    pressed: true,
  });
  assert.equal(sampleFingerPath({ samples: [], t: 0 }), undefined);
});

test("holds the earlier sample across a gap longer than maxGapMs", () => {
  const gapped = [
    { x: 0, y: 0, t: 0, pressed: false },
    { x: 500, y: 0, t: 1000, pressed: true },
  ];
  assert.deepEqual(
    sampleFingerPath({ samples: gapped, t: 600, maxGapMs: 150 }),
    { x: 0, y: 0, pressed: false }
  );
});
