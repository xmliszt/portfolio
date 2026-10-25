import assert from "node:assert/strict";
import { test } from "node:test";

import { getDecorationPose } from "./get-decoration-pose";

test("decoration reactions enter, hold the pose and settle without overshooting", () => {
  const pose = (progress: number) =>
    getDecorationPose({ progress, reducedMotion: false });
  assert.equal(pose(0), 0);
  assert.ok(pose(0.1) > 0 && pose(0.1) < 1);
  assert.equal(pose(0.22), 1);
  assert.equal(pose(0.65), 1);
  assert.ok(pose(0.8) < pose(0.7));
  assert.equal(pose(1), 0);
  assert.equal(pose(2), 0);
  for (const step of Array.from({ length: 101 }, (_, index) => index / 100)) {
    assert.ok(pose(step) >= 0 && pose(step) <= 1);
  }
});

test("reduced motion holds one pose and resets without interpolating", () => {
  for (const progress of [0, 0.2, 0.65, 0.99]) {
    assert.equal(getDecorationPose({ progress, reducedMotion: true }), 1);
  }
  assert.equal(getDecorationPose({ progress: 1, reducedMotion: true }), 0);
});
