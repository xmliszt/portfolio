import assert from "node:assert/strict";
import { test } from "node:test";

import { isTrackedPost } from "./is-tracked-post";

test("tracks scheduled and posted posts and reposts", () => {
  assert.equal(
    isTrackedPost({ kind: "post", status: "scheduled", repostAs: "post" }),
    true
  );
  assert.equal(
    isTrackedPost({ kind: "post", status: "posted", repostAs: "post" }),
    true
  );
  assert.equal(
    isTrackedPost({ kind: "repost", status: "scheduled", repostAs: "post" }),
    true
  );
  assert.equal(
    isTrackedPost({ kind: "repost", status: "posted", repostAs: "post" }),
    true
  );
});

test("leaves out drafts, skipped posts, replies and comments", () => {
  assert.equal(
    isTrackedPost({ kind: "repost", status: "draft", repostAs: "post" }),
    false
  );
  assert.equal(
    isTrackedPost({ kind: "repost", status: "skipped", repostAs: "post" }),
    false
  );
  assert.equal(
    isTrackedPost({ kind: "reply", status: "scheduled", repostAs: "post" }),
    false
  );
  assert.equal(
    isTrackedPost({ kind: "comment", status: "posted", repostAs: "post" }),
    false
  );
});

test("leaves out plain reposts", () => {
  assert.equal(
    isTrackedPost({ kind: "repost", status: "posted", repostAs: "repost" }),
    false
  );
  assert.equal(
    isTrackedPost({ kind: "repost", status: "posted", repostAs: "quote" }),
    true
  );
});
