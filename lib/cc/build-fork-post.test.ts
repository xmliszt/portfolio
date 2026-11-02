import assert from "node:assert/strict";
import { test } from "node:test";

import { buildForkPost } from "./build-fork-post";
import { buildPostRow } from "./testing/build-post-row";

test("a posted post forked on its platform becomes its repost, keeping media", () => {
  const source = buildPostRow({
    status: "posted",
    platform: "threads",
    target: "Digital Art",
  });
  const fork = buildForkPost({
    source,
    platformId: "threads",
    hasRepost: false,
  });
  assert.equal(fork.kind, "ok");
  if (fork.kind !== "ok") return;
  assert.equal(fork.fields.kind, "repost");
  assert.equal(fork.fields.parent_post_id, "post-1");
  assert.equal(fork.fields.target, "Digital Art");
  assert.deepEqual(fork.fields.assets, source.assets);
});

test("a fork on another platform is a new post without the target", () => {
  const source = buildPostRow({
    status: "posted",
    platform: "threads",
    target: "Digital Art",
  });
  const fork = buildForkPost({ source, platformId: "x", hasRepost: true });
  assert.equal(fork.kind === "ok" && fork.fields.kind, "post");
  assert.equal(fork.kind === "ok" && fork.fields.parent_post_id, null);
  assert.equal(fork.kind === "ok" && fork.fields.target, null);
});

test("a fork of an unposted post is a new post", () => {
  const fork = buildForkPost({
    source: buildPostRow({}),
    platformId: "x",
    hasRepost: false,
  });
  assert.equal(fork.kind === "ok" && fork.fields.kind, "post");
});

test("refuses a second repost of the same post", () => {
  const fork = buildForkPost({
    source: buildPostRow({ status: "posted" }),
    platformId: "x",
    hasRepost: true,
  });
  assert.equal(fork.kind, "error");
});
