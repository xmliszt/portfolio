import assert from "node:assert/strict";
import { test } from "node:test";

import { rateTagUsage } from "./rate-tag-usage";

test("rates X terms by posts in the last 7 days", () => {
  assert.equal(rateTagUsage({ platform: "x", weeklyPosts: 4 }), "quiet");
  assert.equal(rateTagUsage({ platform: "x", weeklyPosts: 300 }), "good");
  assert.equal(rateTagUsage({ platform: "x", weeklyPosts: 9_000 }), "busy");
  assert.equal(rateTagUsage({ platform: "x", weeklyPosts: 80_000 }), "crowded");
});

test("rates Threads terms by result count and how fresh the newest post is", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  assert.equal(
    rateTagUsage({ platform: "threads", count: 1, newestAt: now, now }),
    "quiet"
  );
  assert.equal(
    rateTagUsage({ platform: "threads", count: 12, newestAt: now, now }),
    "good"
  );
  assert.equal(
    rateTagUsage({
      platform: "threads",
      count: 25,
      newestAt: new Date("2026-11-02T11:50:00Z"),
      now,
    }),
    "busy"
  );
  assert.equal(
    rateTagUsage({
      platform: "threads",
      count: 25,
      newestAt: new Date("2026-11-01T09:00:00Z"),
      now,
    }),
    "good"
  );
});
