import assert from "node:assert/strict";
import { test } from "node:test";

import { isTrackedPost } from "./is-tracked-post";

test("tracks scheduled and posted posts and reposts", () => {
  assert.equal(isTrackedPost({ kind: "post", status: "scheduled" }), true);
  assert.equal(isTrackedPost({ kind: "post", status: "posted" }), true);
  assert.equal(isTrackedPost({ kind: "repost", status: "scheduled" }), true);
  assert.equal(isTrackedPost({ kind: "repost", status: "posted" }), true);
});

test("leaves out drafts, skipped posts, replies and comments", () => {
  assert.equal(isTrackedPost({ kind: "repost", status: "draft" }), false);
  assert.equal(isTrackedPost({ kind: "repost", status: "skipped" }), false);
  assert.equal(isTrackedPost({ kind: "reply", status: "scheduled" }), false);
  assert.equal(isTrackedPost({ kind: "comment", status: "posted" }), false);
});
