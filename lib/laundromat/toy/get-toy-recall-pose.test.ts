import assert from "node:assert/strict";
import { test } from "node:test";

import { getToyFlightFrame } from "./get-toy-flight-frame";
import { getToyRecallPose } from "./get-toy-recall-pose";
import { TOY_FLIGHT } from "./toy-flight-timeline";

test("recall returns an inverted flying car upright to its parked position", () => {
  const origin = { x: 0.15, y: 5.5, z: 0 };
  const from = getToyFlightFrame({ elapsedMs: 2000, origin }).pose;
  const to = getToyFlightFrame({ elapsedMs: TOY_FLIGHT.totalMs, origin }).pose;
  const start = getToyRecallPose({ from, to, progress: 0 });
  assert.deepEqual(start.center, from.center);
  const end = getToyRecallPose({ from, to, progress: 1 });
  assert.deepEqual(end.center, to.center);
  for (const axis of ["x", "y", "z"] satisfies Array<"x" | "y" | "z">) {
    assert.ok(Math.abs(end.forward[axis] - to.forward[axis]) < 1e-10);
    assert.ok(Math.abs(end.up[axis] - to.up[axis]) < 1e-10);
  }
  const middle = getToyRecallPose({ from, to, progress: 0.5 });
  assert.ok(
    Math.abs(
      Math.hypot(middle.forward.x, middle.forward.y, middle.forward.z) - 1
    ) < 1e-10
  );
  assert.ok(
    Math.abs(
      middle.forward.x * middle.up.x +
        middle.forward.y * middle.up.y +
        middle.forward.z * middle.up.z
    ) < 1e-10
  );
});
