import assert from "node:assert/strict";
import { test } from "node:test";

import { prepareRepostPublish } from "./prepare-repost-publish";

const base = { body: "New first line", hashtags: [], assets: [], target: null };

test("an X quote adds the original's status link, built from its id", () => {
  const result = prepareRepostPublish({
    post: { ...base, kind: "repost", repost_as: "quote" },
    platformId: "x",
    original: { platform_post_id: "123", url: null },
  });
  assert.equal(result.kind, "ok");
  if (result.kind !== "ok") return;
  assert.equal(result.plan.kind, "quote");
  assert.equal(
    result.prepared.text,
    "New first line\n\nhttps://x.com/i/web/status/123"
  );
});

test("an X quote of an original CC cannot find is refused", () => {
  assert.equal(
    prepareRepostPublish({
      post: { ...base, kind: "repost", repost_as: "quote" },
      platformId: "x",
      original: { platform_post_id: null, url: null },
    }).kind,
    "error"
  );
});

test("a plain repost sends no text or media, and needs the original", () => {
  const result = prepareRepostPublish({
    post: { ...base, kind: "repost", repost_as: "repost" },
    platformId: "bluesky",
    original: { platform_post_id: "at://did/app.bsky.feed.post/1", url: null },
  });
  assert.equal(result.kind === "ok" && result.prepared.text, "");
  assert.equal(
    prepareRepostPublish({
      post: { ...base, kind: "repost", repost_as: "repost" },
      platformId: "bluesky",
      original: undefined,
    }).kind,
    "error"
  );
});

test("a Threads quote keeps its own text", () => {
  const result = prepareRepostPublish({
    post: { ...base, kind: "repost", repost_as: "quote" },
    platformId: "threads",
    original: { platform_post_id: "m1", url: null },
  });
  assert.equal(result.kind === "ok" && result.prepared.text, "New first line");
});

test("an X quote refuses an original id that is not an X post id", () => {
  assert.equal(
    prepareRepostPublish({
      post: { ...base, kind: "repost", repost_as: "quote" },
      platformId: "x",
      original: { platform_post_id: "someone/status/1", url: null },
    }).kind,
    "error"
  );
});
