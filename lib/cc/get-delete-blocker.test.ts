import assert from "node:assert/strict";
import { test } from "node:test";

import { getDeleteBlocker } from "./get-delete-blocker";

function buildPost(options: {
  status: string;
  publish_claimed_at?: string;
  publish_error?: string;
}) {
  return {
    status: options.status,
    publish_claimed_at: options.publish_claimed_at ?? null,
    publish_error: options.publish_error ?? null,
  };
}

test("allows deleting a scheduled or posted post with no live reposts", () => {
  assert.equal(
    getDeleteBlocker({
      post: buildPost({ status: "posted" }),
      reposts: [
        buildPost({ status: "skipped" }),
        buildPost({ status: "draft" }),
      ],
    }),
    undefined
  );
});

test("refuses while CC is posting the post or one of its reposts", () => {
  const claimed = buildPost({
    status: "scheduled",
    publish_claimed_at: "2026-11-03T00:00:00Z",
  });
  assert.match(
    getDeleteBlocker({ post: claimed, reposts: [] }) ?? "",
    /posting/
  );
  assert.match(
    getDeleteBlocker({
      post: buildPost({ status: "posted" }),
      reposts: [claimed],
    }) ?? "",
    /posting/
  );
});

test("allows a failed auto-post to be deleted", () => {
  assert.equal(
    getDeleteBlocker({
      post: buildPost({
        status: "scheduled",
        publish_claimed_at: "2026-11-03T00:00:00Z",
        publish_error: "boom",
      }),
      reposts: [],
    }),
    undefined
  );
});

test("refuses when a repost is already live", () => {
  assert.match(
    getDeleteBlocker({
      post: buildPost({ status: "posted" }),
      reposts: [buildPost({ status: "posted" })],
    }) ?? "",
    /live repost/
  );
});
