import assert from "node:assert/strict";
import { test } from "node:test";

import { getCumulativeViews } from "./get-cumulative-views";
import type { PlatformId } from "./platforms";
import type { MetricCheckpoint, StatMetric, StatPost } from "./stats-types";

function buildPost(options: { id: string; platform: PlatformId }): StatPost {
  return {
    id: options.id,
    platform: options.platform,
    postedAt: undefined,
    hashtags: [],
    body: "",
    variant: "mine",
    variantGroup: undefined,
  };
}

function buildMetric(options: {
  postId: string;
  checkpoint?: MetricCheckpoint;
  capturedAt: Date;
  views?: number;
}): StatMetric {
  return {
    postId: options.postId,
    checkpoint: options.checkpoint ?? "24h",
    capturedAt: options.capturedAt,
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
  buildPost({ id: "a", platform: "x" }),
  buildPost({ id: "b", platform: "x" }),
  buildPost({ id: "c", platform: "xiaohongshu" }),
  buildPost({ id: "d", platform: "producthunt" }),
];

test("sums each post's latest views at the end of every Singapore day", () => {
  const metrics = [
    buildMetric({
      postId: "a",
      checkpoint: "1h",
      capturedAt: new Date("2026-11-03T13:00:00Z"),
      views: 100,
    }),
    buildMetric({
      postId: "a",
      capturedAt: new Date("2026-11-04T13:00:00Z"),
      views: 400,
    }),
    buildMetric({
      postId: "b",
      checkpoint: "1h",
      capturedAt: new Date("2026-11-04T15:30:00Z"),
      views: 50,
    }),
    buildMetric({
      postId: "c",
      capturedAt: new Date("2026-11-05T12:00:00Z"),
      views: 900,
    }),
    buildMetric({
      postId: "d",
      capturedAt: new Date("2026-11-05T12:00:00Z"),
      views: undefined,
    }),
  ];
  const result = getCumulativeViews({ posts, metrics });
  assert.deepEqual(
    result.dayEnds.map((date) => date.toISOString()),
    [
      "2026-11-03T16:00:00.000Z",
      "2026-11-04T16:00:00.000Z",
      "2026-11-05T16:00:00.000Z",
    ]
  );
  assert.deepEqual(result.series, [
    { platformId: "x", values: [100, 450, 450] },
    { platformId: "xiaohongshu", values: [0, 0, 900] },
  ]);
});

test("returns no days without logged views", () => {
  assert.deepEqual(getCumulativeViews({ posts, metrics: [] }), {
    dayEnds: [],
    series: [],
  });
});
