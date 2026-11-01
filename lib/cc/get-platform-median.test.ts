import assert from "node:assert/strict";
import { test } from "node:test";

import { getPlatformMedian } from "./get-platform-median";
import type { PlatformId } from "./platforms";
import type { MetricCheckpoint, StatMetric, StatPost } from "./stats-types";

function buildPost(options: {
  id: string;
  platform?: PlatformId;
  kind?: string;
  postedAt?: Date;
  hashtags?: string[];
}): StatPost {
  return {
    id: options.id,
    platform: options.platform ?? "x",
    kind: options.kind ?? "post",
    postedAt: options.postedAt,
    hashtags: options.hashtags ?? [],
    body: "",
    variant: "mine",
    variantGroup: undefined,
  };
}

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

test("returns the middle value for an odd count", () => {
  const posts = ["a", "b", "c"].map((id) => buildPost({ id }));
  const metrics = [
    buildMetric({ postId: "a", views: 300 }),
    buildMetric({ postId: "b", views: 100 }),
    buildMetric({ postId: "c", views: 200 }),
  ];
  assert.equal(getPlatformMedian({ posts, metrics, platformId: "x" }), 200);
});

test("averages the two middle values for an even count", () => {
  const posts = ["a", "b", "c", "d"].map((id) => buildPost({ id }));
  const metrics = [
    buildMetric({ postId: "a", views: 100 }),
    buildMetric({ postId: "b", views: 200 }),
    buildMetric({ postId: "c", views: 400 }),
    buildMetric({ postId: "d", views: 1000 }),
  ];
  assert.equal(getPlatformMedian({ posts, metrics, platformId: "x" }), 300);
});

test("ignores other platforms and posts without 24h views", () => {
  const posts = [
    buildPost({ id: "a" }),
    buildPost({ id: "b" }),
    buildPost({ id: "c", platform: "threads" }),
  ];
  const metrics = [
    buildMetric({ postId: "a", views: 100 }),
    buildMetric({ postId: "b", checkpoint: "1h", views: 50 }),
    buildMetric({ postId: "c", views: 9000 }),
  ];
  assert.equal(getPlatformMedian({ posts, metrics, platformId: "x" }), 100);
  assert.equal(
    getPlatformMedian({ posts, metrics, platformId: "reddit" }),
    undefined
  );
});

test("leaves reposts out so a strong repost does not move the median", () => {
  const posts = [
    buildPost({ id: "a" }),
    buildPost({ id: "b" }),
    buildPost({ id: "c" }),
    buildPost({ id: "repost", kind: "repost" }),
  ];
  const metrics = [
    buildMetric({ postId: "a", views: 100 }),
    buildMetric({ postId: "b", views: 200 }),
    buildMetric({ postId: "c", views: 300 }),
    buildMetric({ postId: "repost", views: 5000 }),
  ];
  assert.equal(getPlatformMedian({ posts, metrics, platformId: "x" }), 200);
});
