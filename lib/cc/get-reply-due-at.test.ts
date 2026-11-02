import assert from "node:assert/strict";
import { test } from "node:test";

import { getReplyDueAt } from "./get-reply-due-at";

const parent = {
  scheduled_at: "2026-11-03T13:00:00.000Z",
  posted_at: "2026-11-03T13:40:00.000Z",
  status: "posted",
};

test("keeps the planned gap after the parent's actual posting time", () => {
  assert.equal(
    getReplyDueAt({
      reply: {
        scheduled_at: "2026-11-03T13:05:00.000Z",
        posted_at: null,
        status: "scheduled",
      },
      parent,
    })?.toISOString(),
    "2026-11-03T13:45:00.000Z"
  );
});

test("never goes before the parent and waits while the parent is not posted", () => {
  assert.equal(
    getReplyDueAt({
      reply: {
        scheduled_at: "2026-11-03T12:00:00.000Z",
        posted_at: null,
        status: "scheduled",
      },
      parent,
    })?.toISOString(),
    "2026-11-03T13:40:00.000Z"
  );
  assert.equal(
    getReplyDueAt({
      reply: {
        scheduled_at: "2026-11-03T13:05:00.000Z",
        posted_at: null,
        status: "scheduled",
      },
      parent: { ...parent, status: "scheduled", posted_at: null },
    }),
    undefined
  );
});
