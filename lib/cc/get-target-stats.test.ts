import assert from "node:assert/strict";
import { test } from "node:test";

import { getTargetStats } from "./get-target-stats";
import type { StatMetric } from "./stats-types";

const post = (options: {
  id: string;
  target: string | undefined;
  posted?: boolean;
}) => ({
  id: options.id,
  platform: "threads" as const,
  postedAt:
    options.posted === false ? undefined : new Date("2026-11-01T14:00:00Z"),
  hashtags: [],
  body: "",
  variant: "mine" as const,
  variantGroup: undefined,
  target: options.target,
});

const views = (postId: string, value: number): StatMetric => ({
  postId,
  checkpoint: "24h",
  capturedAt: new Date("2026-11-02T14:00:00Z"),
  views: value,
  likes: undefined,
  comments: undefined,
  shares: undefined,
  saves: undefined,
  clicks: undefined,
  upvotes: undefined,
  rank: undefined,
});

test("groups posted posts by target, case-insensitively, and ranks by median 24 h views", () => {
  assert.deepEqual(
    getTargetStats({
      posts: [
        post({ id: "a", target: "Digital Art" }),
        post({ id: "b", target: "digital art" }),
        post({ id: "c", target: "Cats" }),
        post({ id: "d", target: undefined }),
        post({ id: "e", target: "Cats", posted: false }),
      ],
      metrics: [views("a", 100), views("b", 300), views("c", 500)],
    }),
    [
      {
        platform: "threads",
        target: "Cats",
        posted: 1,
        median: 500,
        best: 500,
      },
      {
        platform: "threads",
        target: "Digital Art",
        posted: 2,
        median: 200,
        best: 300,
      },
    ]
  );
});
