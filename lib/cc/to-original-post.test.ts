import assert from "node:assert/strict";
import { test } from "node:test";

import { toOriginalPost } from "./to-original-post";

test("reads a link as the post's url", () => {
  assert.deepEqual(toOriginalPost(" https://x.com/a/status/123 "), {
    platform_post_id: null,
    url: "https://x.com/a/status/123",
  });
});

test("reads anything else as the platform's post id", () => {
  assert.deepEqual(toOriginalPost("18028371234567890"), {
    platform_post_id: "18028371234567890",
    url: null,
  });
  assert.deepEqual(toOriginalPost("at://did:plc:abc/app.bsky.feed.post/3k"), {
    platform_post_id: "at://did:plc:abc/app.bsky.feed.post/3k",
    url: null,
  });
});

test("adds https to a link without a scheme", () => {
  assert.deepEqual(toOriginalPost("x.com/someone/status/123"), {
    platform_post_id: null,
    url: "https://x.com/someone/status/123",
  });
});
