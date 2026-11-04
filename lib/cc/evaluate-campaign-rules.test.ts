import mapValues from "lodash/mapValues.js";
import range from "lodash/range.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";
import { CAMPAIGN_RULES } from "./campaign-rules";
import {
  evaluateCampaignRules,
  type RulePost,
} from "./evaluate-campaign-rules";
import type { SlotScores } from "./get-slot-scores";
import { type PlatformId, PLATFORMS } from "./platforms";
import type { StatMetric } from "./stats-types";

const NOW = new Date("2026-11-02T02:40:00Z");
const FLAT_HEAT: SlotScores = {
  source: "own",
  cells: range(7).map(() => range(24).map(() => 1)),
};
const HEAT = mapValues(PLATFORMS, () => FLAT_HEAT);

function buildPost(options: {
  id: string;
  platform?: PlatformId;
  kind?: string;
  status?: string;
  parentPostId?: string;
  at?: Date;
  postedAt?: Date;
}): RulePost {
  return {
    id: options.id,
    platform: options.platform ?? "x",
    kind: options.kind ?? "post",
    status: options.status ?? "posted",
    parentPostId: options.parentPostId,
    at: options.at ?? new Date("2026-10-01T13:00:00Z"),
    postedAt: options.postedAt ?? new Date("2026-10-01T13:00:00Z"),
  };
}

function buildMetric(options: { postId: string; views: number }): StatMetric {
  return {
    postId: options.postId,
    checkpoint: "24h",
    capturedAt: new Date("2026-11-02T00:00:00Z"),
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

function evaluate(options: {
  posts: RulePost[];
  views: { [postId: string]: number };
  suggestedPostIds?: string[];
  occupied?: { at: Date; platformId: PlatformId }[];
}) {
  return evaluateCampaignRules({
    rules: CAMPAIGN_RULES,
    posts: options.posts,
    metrics: Object.entries(options.views).map(([postId, views]) =>
      buildMetric({ postId, views })
    ),
    suggestedPostIds: options.suggestedPostIds ?? [],
    now: NOW,
    plan: DEFAULT_CAMPAIGN_PLAN,
    heat: HEAT,
    occupied: options.occupied ?? [],
  });
}

test("schedules a quote-post of a strong X post at the first evening slot three days later", () => {
  const actions = evaluate({
    posts: [buildPost({ id: "a" }), buildPost({ id: "b" })],
    views: { a: 400, b: 100 },
  });
  assert.deepEqual(
    actions.map((action) => [
      action.kind,
      action.postId,
      action.ratio,
      ...(action.kind === "schedule-repost"
        ? [action.mode, action.at.toISOString()]
        : []),
    ]),
    [["schedule-repost", "a", 1.6, "quote", "2026-11-05T12:00:00.000Z"]]
  );
});

test("keeps a new repost off a time a custom post holds", () => {
  const actions = evaluate({
    posts: [buildPost({ id: "a" }), buildPost({ id: "b" })],
    views: { a: 400, b: 100 },
    occupied: [
      { at: new Date("2026-11-05T12:00:00.000Z"), platformId: "threads" },
    ],
  });
  const repost = actions.find((action) => action.kind === "schedule-repost");
  assert.ok(repost?.kind === "schedule-repost", "a repost is scheduled");
  assert.notEqual(repost.at.toISOString(), "2026-11-05T12:00:00.000Z");
});

test("suggests a re-cut for a weak post only once the platform has three measured posts", () => {
  const posts = [
    buildPost({ id: "a" }),
    buildPost({ id: "b" }),
    buildPost({ id: "c" }),
  ];
  assert.deepEqual(
    evaluate({ posts, views: { a: 40, b: 100, c: 100 } }).map((action) => [
      action.kind,
      action.postId,
    ]),
    [["suggest-recut", "a"]]
  );
  assert.deepEqual(evaluate({ posts, views: { a: 40, b: 100 } }), []);
});

test("skips a re-cut already suggested", () => {
  const actions = evaluate({
    posts: [
      buildPost({ id: "a" }),
      buildPost({ id: "b" }),
      buildPost({ id: "c" }),
    ],
    views: { a: 40, b: 100, c: 100 },
    suggestedPostIds: ["a"],
  });
  assert.deepEqual(actions, []);
});

test("skips a post that already has a repost, even a skipped one", () => {
  const actions = evaluate({
    posts: [
      buildPost({ id: "a" }),
      buildPost({ id: "b" }),
      buildPost({
        id: "r",
        kind: "repost",
        status: "skipped",
        parentPostId: "a",
      }),
    ],
    views: { a: 400, b: 100 },
  });
  assert.deepEqual(actions, []);
});

test("puts two reposts on one platform on different days, strongest first", () => {
  const actions = evaluate({
    posts: ["a", "b", "c", "d", "e"].map((id) => buildPost({ id })),
    views: { a: 300, b: 400, c: 100, d: 100, e: 100 },
  });
  assert.deepEqual(
    actions.map((action) => [
      action.postId,
      action.kind === "schedule-repost" ? action.at.toISOString() : undefined,
    ]),
    [
      ["b", "2026-11-05T12:00:00.000Z"],
      ["a", "2026-11-06T12:00:00.000Z"],
    ]
  );
});

test("keeps a new repost off a day that already has a live repost on that platform", () => {
  const actions = evaluate({
    posts: [
      buildPost({ id: "a" }),
      buildPost({ id: "b" }),
      buildPost({
        id: "r",
        kind: "repost",
        status: "scheduled",
        parentPostId: "other",
        at: new Date("2026-11-05T15:00:00Z"),
      }),
    ],
    views: { a: 400, b: 100 },
  });
  assert.deepEqual(
    actions.map((action) =>
      action.kind === "schedule-repost" ? action.at.toISOString() : undefined
    ),
    ["2026-11-06T12:00:00.000Z"]
  );
});

test("waits the platform's repost gap after the original was posted", () => {
  const postedAt = new Date("2026-11-01T13:00:00Z");
  const actions = evaluate({
    posts: [
      buildPost({ id: "a", platform: "threads", at: postedAt, postedAt }),
      buildPost({ id: "b", platform: "threads" }),
    ],
    views: { a: 400, b: 100 },
  });
  assert.deepEqual(
    actions.map((action) =>
      action.kind === "schedule-repost"
        ? [action.mode, action.at.toISOString()]
        : [action.kind]
    ),
    [["recut", "2026-11-15T13:00:00.000Z"]]
  );
});

test("never schedules a repost on Reddit, Product Hunt, YouTube or WeChat Moments, only suggests one once", () => {
  const platforms = [
    "reddit",
    "producthunt",
    "youtube",
    "wechat_moments",
  ] as const;
  const posts = platforms.flatMap((platform) => [
    buildPost({ id: `${platform}-strong`, platform }),
    buildPost({ id: `${platform}-other`, platform }),
  ]);
  const views = Object.fromEntries(
    platforms.flatMap((platform) => [
      [`${platform}-strong`, 400],
      [`${platform}-other`, 100],
    ])
  );
  const actions = evaluate({ posts, views });
  assert.deepEqual(
    actions.map((action) => [action.kind, action.postId]).toSorted(),
    platforms
      .map((platform) => ["suggest-repost", `${platform}-strong`])
      .toSorted()
  );
  assert.deepEqual(
    evaluate({
      posts,
      views,
      suggestedPostIds: platforms.map((platform) => `${platform}-strong`),
    }),
    []
  );
});

test("never treats a repost or a draft as an original", () => {
  const actions = evaluate({
    posts: [
      buildPost({ id: "r", kind: "repost", parentPostId: "x1" }),
      buildPost({ id: "x1" }),
      buildPost({ id: "d", status: "draft" }),
    ],
    views: { r: 400, x1: 100, d: 400 },
  });
  assert.deepEqual(actions, []);
});

test("sends no re-cut suggestion for a post that already has a repost", () => {
  const actions = evaluate({
    posts: [
      buildPost({ id: "a" }),
      buildPost({ id: "b" }),
      buildPost({ id: "c" }),
      buildPost({ id: "r", kind: "repost", parentPostId: "a" }),
    ],
    views: { a: 40, b: 100, c: 100 },
  });
  assert.deepEqual(actions, []);
});
