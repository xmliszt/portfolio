import assert from "node:assert/strict";
import { test } from "node:test";

import { curlPagePoint } from "./curl-page-point";

const page = { width: 500, height: 840, curlStrength: 0.55 };

test("leaves the page flat before the turn starts", () => {
  for (const x of [0, 250, 500]) {
    assert.deepEqual(curlPagePoint({ ...page, x, y: 420, progress: 0 }), {
      x,
      z: 0,
      angle: 0,
    });
  }
});

test("lays the page mirrored over the spine when the turn ends", () => {
  for (const x of [100, 250, 500]) {
    const point = curlPagePoint({ ...page, x, y: 420, progress: 1 });
    assert.ok(Math.abs(point.x + x) < 2, `x ${x} landed at ${point.x}`);
  }
});

test("keeps the spine edge in place halfway through the turn", () => {
  const point = curlPagePoint({ ...page, x: 0, y: 420, progress: 0.5 });
  assert.equal(point.x, 0);
  assert.equal(point.z, 0);
});

test("lifts the outer edge off the page halfway through, the bottom corner first", () => {
  const top = curlPagePoint({ ...page, x: 500, y: 0, progress: 0.3 });
  const bottom = curlPagePoint({ ...page, x: 500, y: 840, progress: 0.3 });
  assert.ok(bottom.z > 0);
  assert.ok(bottom.angle > top.angle);
});
