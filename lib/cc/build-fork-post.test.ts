import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPostRow } from "@/lib/cc/testing/build-post-row";

import { buildForkPost } from "./build-fork-post";

test("a posted post forked on its platform becomes its repost, keeping media", () => {
  const source = buildPostRow({
    status: "posted",
    platform: "threads",
    target: "Digital Art",
  });
  const fork = buildForkPost({
    source,
    platformId: "threads",
    existingRepost: undefined,
  });
  assert.equal(fork.kind, "insert");
  if (fork.kind !== "insert") return;
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
  const fork = buildForkPost({
    source,
    platformId: "x",
    existingRepost: { id: "r1", status: "posted" },
  });
  assert.equal(fork.kind, "insert");
  if (fork.kind !== "insert") return;
  assert.equal(fork.fields.kind, "post");
  assert.equal(fork.fields.parent_post_id, null);
  assert.equal(fork.fields.target, null);
});

test("a fork of an unposted post is a new post", () => {
  const fork = buildForkPost({
    source: buildPostRow({}),
    platformId: "x",
    existingRepost: undefined,
  });
  assert.equal(fork.kind, "insert");
  if (fork.kind !== "insert") return;
  assert.equal(fork.fields.kind, "post");
});

test("replaces a skipped repost instead of adding a second one", () => {
  const fork = buildForkPost({
    source: buildPostRow({ status: "posted" }),
    platformId: "x",
    existingRepost: { id: "r1", status: "skipped" },
  });
  assert.equal(fork.kind, "replace");
  if (fork.kind !== "replace") return;
  assert.equal(fork.repostId, "r1");
  assert.equal(fork.fields.kind, "repost");
});

test("points at the existing repost when it is posted or waiting", () => {
  for (const status of ["posted", "scheduled", "draft"]) {
    const fork = buildForkPost({
      source: buildPostRow({ status: "posted" }),
      platformId: "x",
      existingRepost: { id: "r1", status },
    });
    assert.equal(fork.kind, "error");
    if (fork.kind !== "error") return;
    assert.equal(fork.openPostId, "r1");
  }
});

test("refuses to fork an unposted repost on its own platform", () => {
  const draft = buildForkPost({
    source: buildPostRow({
      kind: "repost",
      parent_post_id: "p0",
      status: "draft",
    }),
    platformId: "x",
    existingRepost: undefined,
  });
  assert.equal(draft.kind, "error");
  if (draft.kind !== "error") return;
  assert.equal(draft.openPostId, undefined);
  const skipped = buildForkPost({
    source: buildPostRow({
      kind: "repost",
      parent_post_id: "p0",
      status: "skipped",
    }),
    platformId: "x",
    existingRepost: undefined,
  });
  assert.equal(skipped.kind, "error");
  if (skipped.kind !== "error") return;
  assert.equal(skipped.openPostId, "p0");
});
