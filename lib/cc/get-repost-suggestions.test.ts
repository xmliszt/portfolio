import assert from "node:assert/strict";
import { test } from "node:test";

import { getRepostSuggestions } from "./get-repost-suggestions";
import type { PlatformId } from "./platforms";
import type { MetricCheckpoint, StatMetric, StatPost } from "./stats-types";

function buildPost(options: {
  id: string;
  platform?: PlatformId;
  postedAt?: Date;
  hashtags?: string[];
}): StatPost {
  return {
    id: options.id,
    platform: options.platform ?? "x",
    kind: "post",
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

test("suggests posts at 1.5x or more of their platform median", () => {
  const posts = [
    buildPost({ id: "a" }),
    buildPost({ id: "b" }),
    buildPost({ id: "c" }),
    buildPost({ id: "d" }),
  ];
  const metrics = [
    buildMetric({ postId: "a", views: 100 }),
    buildMetric({ postId: "b", views: 200 }),
    buildMetric({ postId: "c", views: 300 }),
    buildMetric({ postId: "d", views: 600 }),
  ];
  assert.deepEqual(
    getRepostSuggestions({ posts, metrics }).map((suggestion) => [
      suggestion.post.id,
      suggestion.ratio,
    ]),
    [["d", 2.4]]
  );
});

test("includes a post at exactly 1.5x and skips a lone post", () => {
  const posts = [
    buildPost({ id: "a" }),
    buildPost({ id: "b" }),
    buildPost({ id: "c" }),
    buildPost({ id: "solo", platform: "threads" }),
  ];
  const metrics = [
    buildMetric({ postId: "a", views: 100 }),
    buildMetric({ postId: "b", views: 200 }),
    buildMetric({ postId: "c", views: 300 }),
    buildMetric({ postId: "solo", views: 5000 }),
  ];
  assert.deepEqual(
    getRepostSuggestions({ posts, metrics }).map(
      (suggestion) => suggestion.post.id
    ),
    ["c"]
  );
});
