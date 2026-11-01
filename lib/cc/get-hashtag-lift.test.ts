import assert from "node:assert/strict";
import { test } from "node:test";

import { getHashtagLift } from "./get-hashtag-lift";
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

const posts = [
  buildPost({ id: "a", platform: "instagram", hashtags: ["#cats", "#art"] }),
  buildPost({ id: "b", platform: "instagram", hashtags: ["#Cats", "#art"] }),
  buildPost({ id: "c", platform: "instagram", hashtags: ["cats", "#art"] }),
  buildPost({ id: "d", platform: "instagram", hashtags: ["#art", "#riso"] }),
  buildPost({ id: "e", platform: "instagram", hashtags: ["#riso", "#riso"] }),
  buildPost({ id: "f", platform: "instagram", hashtags: ["#cats"] }),
  buildPost({ id: "g", platform: "tiktok", hashtags: ["#cats"] }),
];

const metrics = [
  buildMetric({ postId: "a", views: 300 }),
  buildMetric({ postId: "b", views: 400 }),
  buildMetric({ postId: "c", views: 500 }),
  buildMetric({ postId: "d", views: 100 }),
  buildMetric({ postId: "e", views: 100 }),
  buildMetric({ postId: "g", views: 999 }),
];

test("compares mean 24h views with and without each tag used 3+ times", () => {
  assert.deepEqual(getHashtagLift({ posts, metrics }), [
    {
      platform: "instagram",
      tag: "cats",
      uses: 3,
      meanWith: 400,
      meanWithout: 100,
      lift: 4,
    },
    {
      platform: "instagram",
      tag: "art",
      uses: 4,
      meanWith: 325,
      meanWithout: 100,
      lift: 3.25,
    },
  ]);
});

test("leaves lift undefined when every post has the tag", () => {
  const sameTag = ["a", "b", "c"].map((id) =>
    buildPost({ id, platform: "x", hashtags: ["#paws"] })
  );
  assert.deepEqual(getHashtagLift({ posts: sameTag, metrics }), [
    {
      platform: "x",
      tag: "paws",
      uses: 3,
      meanWith: 400,
      meanWithout: undefined,
      lift: undefined,
    },
  ]);
});
