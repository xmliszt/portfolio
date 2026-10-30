import assert from "node:assert/strict";
import { test } from "node:test";

import { hashIp } from "./hash-ip";

test("hashes the same address the same way under one secret", () => {
  const hash = hashIp({ ip: "203.0.113.7", secret: "s" });
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hashIp({ ip: "203.0.113.7", secret: "s" }), hash);
  assert.notEqual(hashIp({ ip: "203.0.113.7", secret: "t" }), hash);
  assert.notEqual(hashIp({ ip: "203.0.113.8", secret: "s" }), hash);
});
