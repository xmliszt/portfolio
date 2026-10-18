import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyTrackPose } from "./get-toy-track-pose";
import { TOY_SET } from "./toy-set-geometry";
import { TOY_TRACK_SECTIONS } from "./toy-track-sections";

const TOLERANCE = 1e-3;

test("starts on the base heading toward the ramp", () => {
  const pose = getToyTrackPose(0);
  assert.equal(pose.y, TOY_SET.carStartY);
  assert.equal(pose.z, TOY_SET.base.height);
  assert.deepEqual(pose.tangent, { y: -1, z: 0 });
  assert.deepEqual(pose.normal, { y: 0, z: 1 });
});

test("leaves the lip upside down, heading back over the base", () => {
  const pose = getToyTrackPose(TOY_TRACK_SECTIONS.lip);
  assert.deepEqual(pose.tangent, { y: 1, z: 0 });
  assert.deepEqual(pose.normal, { y: 0, z: -1 });
});

test("joins every section without a gap or a sharp turn", () => {
  const steps = 400;
  const poses = Array.from({ length: steps + 1 }, (_, index) =>
    getToyTrackPose((TOY_TRACK_SECTIONS.lip * index) / steps)
  );
  poses.slice(1).forEach((pose, index) => {
    const before = poses[index];
    assert.ok(Math.hypot(pose.y - before.y, pose.z - before.z) < 0.05);
    const turn = Math.acos(
      Math.min(
        1,
        before.tangent.y * pose.tangent.y + before.tangent.z * pose.tangent.z
      )
    );
    assert.ok(turn < 0.2, `turns ${turn} rad in one step`);
  });
});

test("is vertical halfway up the curve, riding on its room side", () => {
  const middle = getToyTrackPose(
    (TOY_TRACK_SECTIONS.floor + TOY_TRACK_SECTIONS.curve) / 2
  );
  assert.ok(Math.abs(middle.tangent.y) < TOLERANCE);
  assert.ok(middle.normal.y > 0.999);
});
