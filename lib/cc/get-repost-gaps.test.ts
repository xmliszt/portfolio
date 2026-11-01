import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHistoryPost } from "./testing/build-history-post";
import { getRepostGaps } from "./get-repost-gaps";

test("says whether each platform is past its repost gap when the campaign starts", () => {
  const gaps = getRepostGaps({
    posts: [
      buildHistoryPost({ platformId: "x", at: "2026-11-01T14:00:00Z" }),
      buildHistoryPost({ platformId: "linkedin", at: "2026-11-01T14:00:00Z" }),
      buildHistoryPost({ platformId: "linkedin", at: "2026-11-12T14:00:00Z" }),
      buildHistoryPost({
        platformId: "producthunt",
        at: "2026-10-20T08:00:00Z",
      }),
      buildHistoryPost({
        platformId: "threads",
        at: "2026-11-20T14:00:00Z",
        isPosted: false,
      }),
    ],
    platformIds: ["x", "linkedin", "producthunt", "threads", "reddit"],
    startDate: "2026-11-24",
    lengthDays: 60,
  });
  assert.deepEqual(
    gaps.map((gap) =>
      gap.kind === "no-history"
        ? [gap.platformId, gap.kind]
        : [gap.platformId, gap.kind, gap.daysSince, gap.readyOn]
    ),
    [
      ["x", "ready", 23, "2026-11-08"],
      ["linkedin", "wait", 12, "2027-01-11"],
      ["producthunt", "after-window", 35, "2027-04-18"],
      ["threads", "wait", 4, "2026-12-04"],
      ["reddit", "no-history"],
    ]
  );
});
