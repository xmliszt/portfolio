import assert from "node:assert/strict";
import { test } from "node:test";

import { getHourHeat } from "./get-hour-heat";
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

test("uses researched day weight times hour strength before a platform has 10 measured posts", () => {
  const heat = getHourHeat({ posts: [], metrics: [], platformId: "x" });
  assert.equal(heat.kind, "researched");
  assert.equal(heat.cells.length, 7);
  assert.ok(heat.cells.every((day) => day.length === 24));
  assert.equal(heat.cells[1][22], 1);
  assert.equal(heat.cells[0][22], 0.6);
  assert.equal(heat.cells[5][22], 0.3);
  assert.equal(heat.cells[0][12], 0);
});

test("carries a window past midnight with the weight of the day it starts on", () => {
  const heat = getHourHeat({ posts: [], metrics: [], platformId: "instagram" });
  assert.equal(heat.cells[2][22], 1);
  assert.equal(heat.cells[3][0], 0.8);
  assert.equal(heat.cells[3][1], 0.8);
  assert.equal(heat.cells[2][2], 0);
  const x = getHourHeat({ posts: [], metrics: [], platformId: "x" });
  assert.equal(x.cells[2][1], 0.6);
});

test("takes the strongest overlapping window", () => {
  const heat = getHourHeat({
    posts: [],
    metrics: [],
    platformId: "xiaohongshu",
  });
  assert.deepEqual(heat.cells[5].slice(19, 24), [0, 0.6, 1, 1, 0.6]);
});

test("switches to the platform's own views at 10 measured posts", () => {
  const posts = Array.from({ length: 10 }, (_, index) =>
    buildPost({
      id: String(index),
      postedAt: new Date(
        index < 5 ? "2026-11-02T13:30:00Z" : "2026-11-03T01:00:00Z"
      ),
    })
  );
  const metrics = posts.map((post, index) =>
    buildMetric({ postId: post.id, views: (index + 1) * 100 })
  );
  const heat = getHourHeat({ posts, metrics, platformId: "x" });
  assert.equal(heat.kind, "own");
  assert.equal(heat.cells[0][21], 300);
  assert.equal(heat.cells[1][9], 800);
  assert.equal(heat.cells[0][22], undefined);
});

test("counts only posted posts on the platform with 24h views", () => {
  const posts = [
    ...Array.from({ length: 9 }, (_, index) =>
      buildPost({
        id: String(index),
        postedAt: new Date("2026-11-02T13:30:00Z"),
      })
    ),
    buildPost({ id: "unposted" }),
    buildPost({
      id: "other",
      platform: "threads",
      postedAt: new Date("2026-11-02T13:30:00Z"),
    }),
  ];
  const metrics = posts.map((post) =>
    buildMetric({ postId: post.id, views: 100 })
  );
  assert.equal(
    getHourHeat({ posts, metrics, platformId: "x" }).kind,
    "researched"
  );
});
