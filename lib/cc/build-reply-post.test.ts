import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPostRow } from "./testing/build-post-row";

const now = new Date("2026-11-01T00:00:00.000Z");
import { buildReplyPost } from "./build-reply-post";

test("schedules a reply a minute after the post or its last reply", () => {
  const parent = buildPostRow({ campaign_id: null, project: "Paws" });
  const first = buildReplyPost({ parent, replies: [], now });
  assert.equal(
    first.kind === "ok" && first.fields.scheduled_at,
    "2026-11-02T13:01:00.000Z"
  );
  assert.deepEqual(
    first.kind === "ok" && {
      kind: first.fields.kind,
      parent: first.fields.parent_post_id,
      project: first.fields.project,
      status: first.fields.status,
    },
    { kind: "reply", parent: "post-1", project: "Paws", status: "scheduled" }
  );
  const second = buildReplyPost({
    parent,
    replies: [
      { status: "scheduled", scheduled_at: "2026-11-02T13:05:00.000Z" },
      { status: "skipped", scheduled_at: "2026-11-02T14:00:00.000Z" },
    ],
    now,
  });
  assert.equal(
    second.kind === "ok" && second.fields.scheduled_at,
    "2026-11-02T13:06:00.000Z"
  );
});

test("a reply to an unscheduled draft stays an unscheduled draft", () => {
  const result = buildReplyPost({
    parent: buildPostRow({ status: "draft", scheduled_at: null }),
    replies: [],
    now,
  });
  assert.deepEqual(
    result.kind === "ok" && [result.fields.status, result.fields.scheduled_at],
    ["draft", null]
  );
});

test("refuses other platforms, plain reposts, replies and skipped posts; accepts quotes", () => {
  for (const parent of [
    buildPostRow({ platform: "instagram" }),
    buildPostRow({ kind: "repost", repost_as: "repost", parent_post_id: "p" }),
    buildPostRow({ kind: "reply", parent_post_id: "p" }),
    buildPostRow({ status: "skipped" }),
  ]) {
    assert.equal(buildReplyPost({ parent, replies: [], now }).kind, "error");
  }
  assert.equal(
    buildReplyPost({
      parent: buildPostRow({
        kind: "repost",
        repost_as: "quote",
        parent_post_id: "p",
      }),
      replies: [],
      now,
    }).kind,
    "ok"
  );
});

test("a reply to a live post is scheduled a minute from now", () => {
  const result = buildReplyPost({
    parent: buildPostRow({
      status: "posted",
      posted_at: "2026-11-02T13:00:00.000Z",
    }),
    replies: [],
    now: new Date("2026-11-04T10:00:00.000Z"),
  });
  assert.equal(
    result.kind === "ok" && result.fields.scheduled_at,
    "2026-11-04T10:01:00.000Z"
  );
});
