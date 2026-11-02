import assert from "node:assert/strict";
import { test } from "node:test";

import { planPostReminders } from "./plan-post-reminders";

const scheduledAt = new Date("2026-11-03T13:00:00Z");

const summarize = (reminders: ReturnType<typeof planPostReminders>) =>
  reminders.map((reminder) => ({
    kind: reminder.kind,
    checkpoint: reminder.checkpoint,
    fireAt: reminder.fireAt.toISOString(),
  }));

test("plans only the post reminder at −10 min before the post is posted", () => {
  assert.deepEqual(
    summarize(planPostReminders({ scheduledAt, postedAt: undefined })),
    [{ kind: "post", checkpoint: null, fireAt: "2026-11-03T12:50:00.000Z" }]
  );
});

test("drops the post reminder and counts from the posted time once posted", () => {
  assert.deepEqual(
    summarize(
      planPostReminders({
        scheduledAt,
        postedAt: new Date("2026-11-03T13:07:00Z"),
      })
    ),
    [
      { kind: "reply", checkpoint: null, fireAt: "2026-11-03T13:37:00.000Z" },
      { kind: "log", checkpoint: "1h", fireAt: "2026-11-03T14:07:00.000Z" },
      { kind: "log", checkpoint: "24h", fireAt: "2026-11-04T13:07:00.000Z" },
      { kind: "log", checkpoint: "7d", fireAt: "2026-11-10T13:07:00.000Z" },
    ]
  );
});

test("counts from the posted time when the post goes out hours late", () => {
  assert.deepEqual(
    summarize(
      planPostReminders({
        scheduledAt,
        postedAt: new Date("2026-11-03T16:20:00Z"),
      })
    ).at(1),
    { kind: "log", checkpoint: "1h", fireAt: "2026-11-03T17:20:00.000Z" }
  );
});
