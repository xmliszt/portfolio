import assert from "node:assert/strict";
import { test } from "node:test";

import { getReplyAutoPublishError } from "./get-reply-auto-publish-error";

const now = new Date("2026-11-03T14:00:00.000Z");
const reply = {
  status: "scheduled",
  scheduled_at: "2026-11-03T14:05:00.000Z",
  posted_at: null,
};

test("allows a reply under a parent CC will auto-post", () => {
  assert.equal(
    getReplyAutoPublishError({
      reply,
      parent: {
        status: "scheduled",
        scheduled_at: "2026-11-03T14:00:00.000Z",
        posted_at: null,
        auto_publish: true,
      },
      now,
    }),
    undefined
  );
});

test("refuses under a parent that is posted by hand later, skipped, or long live", () => {
  assert.match(
    getReplyAutoPublishError({
      reply,
      parent: {
        status: "scheduled",
        scheduled_at: "2026-11-03T14:00:00.000Z",
        posted_at: null,
        auto_publish: false,
      },
      now,
    }) ?? "",
    /parent post first/
  );
  assert.match(
    getReplyAutoPublishError({
      reply,
      parent: {
        status: "skipped",
        scheduled_at: null,
        posted_at: null,
        auto_publish: false,
      },
      now,
    }) ?? "",
    /skipped/
  );
  assert.match(
    getReplyAutoPublishError({
      reply: { ...reply, scheduled_at: "2026-11-03T13:05:00.000Z" },
      parent: {
        status: "posted",
        scheduled_at: "2026-11-03T13:00:00.000Z",
        posted_at: "2026-11-03T13:00:00.000Z",
        auto_publish: false,
      },
      now,
    }) ?? "",
    /Post now/
  );
});

test("allows a reply whose time after a live parent is still ahead", () => {
  assert.equal(
    getReplyAutoPublishError({
      reply,
      parent: {
        status: "posted",
        scheduled_at: "2026-11-03T14:00:00.000Z",
        posted_at: "2026-11-03T13:58:00.000Z",
        auto_publish: false,
      },
      now,
    }),
    undefined
  );
});
