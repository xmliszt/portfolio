import assert from "node:assert/strict";
import { test } from "node:test";

import { getAutoPublishState } from "./get-auto-publish-state";

const now = new Date("2026-11-03T14:00:00.000Z");

function buildPost(options: {
  kind?: string;
  originalRef?: string;
  status?: string;
  scheduledAt: string | null;
  postedAt?: string;
  autoPublish?: boolean;
  publishError?: string;
}) {
  return {
    kind: options.kind ?? "post",
    original_ref: options.originalRef ?? null,
    status: options.status ?? "scheduled",
    scheduled_at: options.scheduledAt,
    posted_at: options.postedAt ?? null,
    auto_publish: options.autoPublish ?? true,
    publish_error: options.publishError ?? null,
  };
}

test("a post is due at its time, waits before it, and is missed after 30 minutes", () => {
  assert.equal(
    getAutoPublishState({
      candidate: buildPost({ scheduledAt: "2026-11-03T13:50:00.000Z" }),
      parent: undefined,
      now,
    }).kind,
    "due"
  );
  assert.equal(
    getAutoPublishState({
      candidate: buildPost({ scheduledAt: "2026-11-03T14:10:00.000Z" }),
      parent: undefined,
      now,
    }).kind,
    "wait"
  );
  assert.equal(
    getAutoPublishState({
      candidate: buildPost({ scheduledAt: "2026-11-03T13:00:00.000Z" }),
      parent: undefined,
      now,
    }).kind,
    "missed"
  );
});

test("a reply waits for its parent and counts from the parent's posting time", () => {
  const reply = buildPost({
    kind: "reply",
    scheduledAt: "2026-11-03T12:05:00.000Z",
  });
  const unposted = buildPost({ scheduledAt: "2026-11-03T12:00:00.000Z" });
  assert.equal(
    getAutoPublishState({ candidate: reply, parent: unposted, now }).kind,
    "wait"
  );
  const postedLate = buildPost({
    status: "posted",
    scheduledAt: "2026-11-03T12:00:00.000Z",
    postedAt: "2026-11-03T13:50:00.000Z",
  });
  assert.equal(
    getAutoPublishState({ candidate: reply, parent: postedLate, now }).kind,
    "due"
  );
});

test("a reply whose parent was skipped or deleted is missed", () => {
  const reply = buildPost({
    kind: "reply",
    scheduledAt: "2026-11-03T13:55:00.000Z",
  });
  assert.equal(
    getAutoPublishState({
      candidate: reply,
      parent: buildPost({ status: "skipped", scheduledAt: null }),
      now,
    }).kind,
    "missed"
  );
  assert.equal(
    getAutoPublishState({ candidate: reply, parent: undefined, now }).kind,
    "missed"
  );
});

test("a reply under a parent whose auto-post failed or was turned off is missed", () => {
  const reply = buildPost({
    kind: "reply",
    scheduledAt: "2026-11-03T13:55:00.000Z",
  });
  assert.equal(
    getAutoPublishState({
      candidate: reply,
      parent: buildPost({
        scheduledAt: "2026-11-03T13:50:00.000Z",
        publishError: "boom",
      }),
      now,
    }).kind,
    "missed"
  );
  assert.equal(
    getAutoPublishState({
      candidate: reply,
      parent: buildPost({
        scheduledAt: "2026-11-03T13:50:00.000Z",
        autoPublish: false,
      }),
      now,
    }).kind,
    "missed"
  );
});

test("a reply to an outside post is timed like a post, with no parent", () => {
  const reply = (scheduledAt: string) =>
    buildPost({
      kind: "reply",
      originalRef: "https://x.com/someone/status/1",
      scheduledAt,
    });
  assert.equal(
    getAutoPublishState({
      candidate: reply("2026-11-03T13:50:00.000Z"),
      parent: undefined,
      now,
    }).kind,
    "due"
  );
  assert.equal(
    getAutoPublishState({
      candidate: reply("2026-11-03T14:10:00.000Z"),
      parent: undefined,
      now,
    }).kind,
    "wait"
  );
  assert.equal(
    getAutoPublishState({
      candidate: reply("2026-11-03T13:00:00.000Z"),
      parent: undefined,
      now,
    }).kind,
    "missed"
  );
});
