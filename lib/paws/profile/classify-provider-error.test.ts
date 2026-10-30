import assert from "node:assert/strict";
import { test } from "node:test";

import { classifyProviderError } from "./classify-provider-error";

test("reads 400 and 422 bodies that mention policy or moderation as refusals", () => {
  assert.equal(
    classifyProviderError({ status: 400, body: '{"detail":{"status":"content_policy_violation"}}' }),
    "refusedByProvider"
  );
  assert.equal(classifyProviderError({ status: 422, body: "prompt flagged by moderation" }), "refusedByProvider");
  assert.equal(classifyProviderError({ status: 400, body: '{"detail":{"status":"invalid_content"}}' }), "refusedByProvider");
  assert.equal(classifyProviderError({ status: 400, body: "blocked by safety system" }), "refusedByProvider");
});

test("treats key, quota, server and unrelated client errors as failures", () => {
  assert.equal(classifyProviderError({ status: 400, body: '{"detail":"duration_seconds out of range"}' }), "failed");
  assert.equal(classifyProviderError({ status: 401, body: "invalid api key, policy" }), "failed");
  assert.equal(classifyProviderError({ status: 429, body: "quota" }), "failed");
  assert.equal(classifyProviderError({ status: 503, body: "unsafe" }), "failed");
});
