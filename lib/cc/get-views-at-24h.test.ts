import assert from "node:assert/strict";
import { test } from "node:test";

import { getViewsAt24h } from "./get-views-at-24h";
import type { MetricCheckpoint, StatMetric } from "./stats-types";

function buildMetric(options: {
  postId: string;
  checkpoint?: MetricCheckpoint;
  capturedAt?: Date;
  views?: number;
}): StatMetric {
  return {
    postId: options.postId,
    checkpoint: options.checkpoint ?? "24h",
    capturedAt: options.capturedAt ?? new Date("2026-11-02T00:00:00Z"),
    views: options.views,
    likes: undefined,
    comments: undefined,
    shares: undefined,
    saves: undefined,
    clicks: undefined,
    upvotes: undefined,
    rank: undefined,
  };
}

test("returns the views on the latest 24h row", () => {
  const metrics = [
    buildMetric({ postId: "a", checkpoint: "1h", views: 5 }),
    buildMetric({
      postId: "a",
      capturedAt: new Date("2026-11-02T00:00:00Z"),
      views: 100,
    }),
    buildMetric({
      postId: "a",
      capturedAt: new Date("2026-11-02T03:00:00Z"),
      views: 140,
    }),
  ];
  assert.equal(getViewsAt24h({ metrics, postId: "a" }), 140);
});

test("returns undefined without a 24h row", () => {
  const metrics = [buildMetric({ postId: "a", checkpoint: "1h", views: 5 })];
  assert.equal(getViewsAt24h({ metrics, postId: "a" }), undefined);
});
