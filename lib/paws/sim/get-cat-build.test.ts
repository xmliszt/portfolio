import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "./testing/build-look";
import { getCatBuild } from "./get-cat-build";

test("each step of size, fluff, tail and ears grows its part", () => {
  const steps = ["small", "medium", "large"] as const;
  const builds = steps.map((step) =>
    getCatBuild(buildLook({ size: step, fluff: step, tail: step, ears: step }))
  );
  for (const [i, build] of builds.entries()) {
    if (i === 0) continue;
    const smaller = builds[i - 1];
    assert.ok(build.scale > smaller.scale, "size scales the body");
    assert.ok(build.fluff > smaller.fluff, "fluff softens the edge");
    assert.ok(build.tailRadius > smaller.tailRadius, "tail thickens");
    assert.ok(build.earScale > smaller.earScale, "ears grow");
  }
});

test("a medium cat keeps the prototype's proportions", () => {
  assert.deepEqual(getCatBuild(buildLook()), {
    scale: 0.6,
    fluff: 1,
    tailRadius: 9.5,
    earScale: 1,
  });
});
