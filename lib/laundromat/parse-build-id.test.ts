import assert from "node:assert/strict";
import { test } from "node:test";

import { parseBuildId } from "./parse-build-id";

test("reads the build id from a version response", () => {
  assert.equal(parseBuildId({ buildId: "abc123" }), "abc123");
});

test("returns undefined for a body without a string build id", () => {
  for (const value of [undefined, null, "abc", {}, { buildId: 7 }]) {
    assert.equal(parseBuildId(value), undefined);
  }
});
