import assert from "node:assert/strict";
import { test } from "node:test";

import { pickReplyTarget } from "./pick-reply-target";

function buildReply(options: { id: string; at: string; status: string }) {
  return {
    id: options.id,
    kind: "reply",
    status: options.status,
    scheduled_at: options.at,
    created_at: "2026-11-01T00:00:00.000Z",
  };
}

test("answers the latest posted reply before it, so replies form a thread", () => {
  const one = buildReply({
    id: "r1",
    at: "2026-11-03T13:01:00.000Z",
    status: "posted",
  });
  const two = buildReply({
    id: "r2",
    at: "2026-11-03T13:02:00.000Z",
    status: "posted",
  });
  const three = buildReply({
    id: "r3",
    at: "2026-11-03T13:03:00.000Z",
    status: "scheduled",
  });
  assert.equal(
    pickReplyTarget({
      reply: three,
      parentId: "p",
      siblings: [three, two, one],
    }),
    "r2"
  );
});

test("falls back to the parent when no earlier reply is posted", () => {
  const one = buildReply({
    id: "r1",
    at: "2026-11-03T13:01:00.000Z",
    status: "skipped",
  });
  const two = buildReply({
    id: "r2",
    at: "2026-11-03T13:02:00.000Z",
    status: "scheduled",
  });
  assert.equal(
    pickReplyTarget({ reply: two, parentId: "p", siblings: [one, two] }),
    "p"
  );
});

test("ignores comments and later replies", () => {
  const comment = {
    ...buildReply({
      id: "c1",
      at: "2026-11-03T13:00:30.000Z",
      status: "posted",
    }),
    kind: "comment",
  };
  const later = buildReply({
    id: "r9",
    at: "2026-11-03T14:00:00.000Z",
    status: "posted",
  });
  const reply = buildReply({
    id: "r1",
    at: "2026-11-03T13:01:00.000Z",
    status: "scheduled",
  });
  assert.equal(
    pickReplyTarget({
      reply,
      parentId: "p",
      siblings: [comment, later, reply],
    }),
    "p"
  );
});
