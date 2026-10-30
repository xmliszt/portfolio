import assert from "node:assert/strict";
import { test } from "node:test";

import { hashUserId } from "./hash-user-id";

test("returns the same number in [0, 1) for the same id", () => {
  const value = hashUserId("8d3f2c1e-0000-4000-8000-000000000001");
  assert.ok(value >= 0 && value < 1);
  assert.equal(hashUserId("8d3f2c1e-0000-4000-8000-000000000001"), value);
  assert.notEqual(hashUserId("8d3f2c1e-0000-4000-8000-000000000002"), value);
});
