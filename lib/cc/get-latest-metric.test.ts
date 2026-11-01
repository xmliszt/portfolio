import assert from "node:assert/strict";
import { test } from "node:test";

import { getLatestMetric } from "./get-latest-metric";
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

const metrics = [
  buildMetric({
    postId: "a",
    checkpoint: "1h",
    capturedAt: new Date("2026-11-01T01:00:00Z"),
    views: 10,
  }),
  buildMetric({
    postId: "a",
    checkpoint: "24h",
    capturedAt: new Date("2026-11-02T00:00:00Z"),
    views: 100,
  }),
  buildMetric({
    postId: "a",
    checkpoint: "24h",
    capturedAt: new Date("2026-11-02T02:00:00Z"),
    views: 120,
  }),
  buildMetric({
    postId: "a",
    checkpoint: "extra",
    capturedAt: new Date("2026-11-03T00:00:00Z"),
    views: 150,
  }),
  buildMetric({
    postId: "b",
    checkpoint: "7d",
    capturedAt: new Date("2026-11-09T00:00:00Z"),
    views: 900,
  }),
];

test("returns the latest row at a checkpoint", () => {
  assert.equal(
    getLatestMetric({ metrics, postId: "a", checkpoint: "24h" })?.views,
    120
  );
  assert.equal(
    getLatestMetric({ metrics, postId: "a", checkpoint: "1h" })?.views,
    10
  );
});

test("returns the latest row overall without a checkpoint", () => {
  assert.equal(getLatestMetric({ metrics, postId: "a" })?.views, 150);
});

test("returns undefined when nothing matches", () => {
  assert.equal(
    getLatestMetric({ metrics, postId: "a", checkpoint: "7d" }),
    undefined
  );
  assert.equal(getLatestMetric({ metrics, postId: "c" }), undefined);
});
