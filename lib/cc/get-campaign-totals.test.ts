import assert from "node:assert/strict";
import { test } from "node:test";

import { getCampaignTotals } from "./get-campaign-totals";
import type { MetricField, PlatformId } from "./platforms";
import type { MetricCheckpoint, StatMetric, StatPost } from "./stats-types";

function buildPost(options: { id: string; platform?: PlatformId }): StatPost {
  return {
    id: options.id,
    platform: options.platform ?? "x",
    kind: "post",
    postedAt: new Date("2026-11-03T14:00:00Z"),
    hashtags: [],
    body: "",
    variant: "mine",
    variantGroup: undefined,
  };
}

function buildMetric(options: {
  postId: string;
  checkpoint?: MetricCheckpoint;
  capturedAt?: Date;
  values: Partial<Pick<StatMetric, MetricField>>;
}): StatMetric {
  return {
    postId: options.postId,
    checkpoint: options.checkpoint ?? "24h",
    capturedAt: options.capturedAt ?? new Date("2026-11-04T14:00:00Z"),
    views: options.values.views,
    likes: options.values.likes,
    comments: options.values.comments,
    shares: options.values.shares,
    saves: options.values.saves,
    clicks: options.values.clicks,
    upvotes: options.values.upvotes,
    rank: options.values.rank,
  };
}

test("leaves every total undefined when nothing was logged", () => {
  const totals = getCampaignTotals({
    posts: [buildPost({ id: "a" })],
    metrics: [],
  });
  assert.equal(totals.views24h, undefined);
  assert.deepEqual(totals.viewsByPlatform, []);
  assert.equal(totals.bestRatio, undefined);
  assert.equal(totals.engagementRate, undefined);
  assert.equal(totals.clicks, undefined);
  assert.equal(totals.productHuntUpvotes, undefined);
});

test("sums 24h views per platform and finds the best ratio to its median", () => {
  const totals = getCampaignTotals({
    posts: [
      buildPost({ id: "a" }),
      buildPost({ id: "b" }),
      buildPost({ id: "c", platform: "threads" }),
    ],
    metrics: [
      buildMetric({ postId: "a", values: { views: 300 } }),
      buildMetric({ postId: "b", values: { views: 100 } }),
      buildMetric({ postId: "c", values: { views: 1000 } }),
    ],
  });
  assert.equal(totals.views24h, 1400);
  assert.deepEqual(totals.viewsByPlatform, [
    { platform: "threads", views: 1000 },
    { platform: "x", views: 400 },
  ]);
  assert.deepEqual(totals.bestRatio, { platform: "x", ratio: 1.5 });
});

test("computes engagement and clicks from each post's latest numbers", () => {
  const totals = getCampaignTotals({
    posts: [buildPost({ id: "a" }), buildPost({ id: "b" })],
    metrics: [
      buildMetric({
        postId: "a",
        checkpoint: "1h",
        capturedAt: new Date("2026-11-03T15:00:00Z"),
        values: { views: 10, likes: 9, clicks: 1 },
      }),
      buildMetric({
        postId: "a",
        values: { views: 100, likes: 5, comments: 3, shares: 2, clicks: 4 },
      }),
      buildMetric({ postId: "b", values: { views: 100, clicks: 6 } }),
    ],
  });
  assert.equal(totals.engagementRate, 0.05);
  assert.equal(totals.clicks, 10);
});

test("reads the latest Product Hunt upvotes and rank", () => {
  const totals = getCampaignTotals({
    posts: [buildPost({ id: "ph", platform: "producthunt" })],
    metrics: [
      buildMetric({
        postId: "ph",
        checkpoint: "1h",
        capturedAt: new Date("2026-11-03T09:00:00Z"),
        values: { upvotes: 40, rank: 9 },
      }),
      buildMetric({ postId: "ph", values: { upvotes: 212, rank: 4 } }),
    ],
  });
  assert.equal(totals.productHuntUpvotes, 212);
  assert.equal(totals.productHuntRank, 4);
});
