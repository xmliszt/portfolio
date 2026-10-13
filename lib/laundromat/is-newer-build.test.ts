import assert from "node:assert/strict";
import { test } from "node:test";

import { isNewerBuild } from "./is-newer-build";

test("reports a deployed build that differs from this tab's", () => {
  assert.equal(isNewerBuild({ ownBuildId: "a", deployedBuildId: "b" }), true);
});

test("stays quiet for the same build, an unknown one, or a development tab", () => {
  for (const options of [
    { ownBuildId: "a", deployedBuildId: "a" },
    { ownBuildId: "a", deployedBuildId: undefined },
    { ownBuildId: undefined, deployedBuildId: "b" },
    { ownBuildId: "development", deployedBuildId: "b" },
  ]) {
    assert.equal(isNewerBuild(options), false);
  }
});
