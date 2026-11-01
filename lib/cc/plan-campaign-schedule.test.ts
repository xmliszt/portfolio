import countBy from "lodash/countBy.js";
import mapValues from "lodash/mapValues.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { PAWS_LAUNCH_POSTS } from "./testing/paws-launch-posts";
import { DEFAULT_CAMPAIGN_PLAN } from "./campaign-plan";
import { formatSgt } from "./format-sgt";
import { getDefaultWave } from "./get-default-wave";
import { getHourHeat } from "./get-hour-heat";
import { getPostWindow } from "./get-post-window";
import { getSlotScores } from "./get-slot-scores";
import {
  planCampaignSchedule,
  type PlannerPost,
  type PlanRow,
} from "./plan-campaign-schedule";
import { type PlatformId, PLATFORMS } from "./platforms";

const NOW = new Date("2026-11-02T04:00:00Z");
const MINUTE_MS = 60_000;

const HEAT = mapValues(PLATFORMS, (platform) =>
  getSlotScores({
    heat: getHourHeat({ posts: [], metrics: [], platformId: platform.id }),
    platformId: platform.id,
  })
);

function buildPosts(options: { scheduledBy: "user" | "planner" }) {
  return PAWS_LAUNCH_POSTS.map(
    (post): PlannerPost => ({
      id: post.id,
      platformId: post.platformId,
      status: post.status,
      scheduledAt: new Date(post.scheduledAt),
      scheduledBy: options.scheduledBy,
      wave: PLATFORMS[post.platformId].plannerPinned
        ? undefined
        : getDefaultWave(post.files.map((file) => ({ file, alt: "" }))),
      notBefore: undefined,
      notAfter: undefined,
    })
  );
}

function plan(options: {
  posts: readonly PlannerPost[];
  includeUserPlaced: boolean;
  reposts?: readonly { at: Date; platformId: PlatformId }[];
}) {
  return planCampaignSchedule({
    posts: options.posts,
    plan: DEFAULT_CAMPAIGN_PLAN,
    heat: HEAT,
    now: NOW,
    includeUserPlaced: options.includeUserPlaced,
    reposts: options.reposts ?? [],
  });
}

function getTime(row: PlanRow) {
  return row.kind === "moved" || row.kind === "unchanged"
    ? row.proposed
    : row.current;
}

test("leaves posts placed by hand alone unless asked", () => {
  const rows = plan({
    posts: buildPosts({ scheduledBy: "user" }),
    includeUserPlaced: false,
  });
  assert.ok(rows.every((row) => row.kind === "pinned"));
  assert.equal(rows.length, 14);
});

test("plans the Paws posts wave by wave within the owner's limits", () => {
  const rows = plan({
    posts: buildPosts({ scheduledBy: "user" }),
    includeUserPlaced: true,
  });
  const placed = rows.flatMap((row) =>
    row.kind === "moved" || row.kind === "unchanged" ? [row] : []
  );
  assert.equal(placed.length, 13);
  assert.ok(rows.every((row) => row.kind !== "unplaced"));

  const productHunt = rows.find((row) => row.platformId === "producthunt");
  assert.equal(productHunt?.kind, "pinned");

  const times = rows
    .flatMap((row) => {
      const time = getTime(row);
      return time === undefined ? [] : [time];
    })
    .toSorted((a, b) => a.getTime() - b.getTime());
  assert.ok(times.every((time) => time.getTime() >= NOW.getTime()));
  times.slice(1).forEach((time, index) => {
    const gapMinutes = (time.getTime() - times[index].getTime()) / MINUTE_MS;
    assert.ok(gapMinutes >= 45, `gap of ${gapMinutes} minutes`);
  });
  const perDay = countBy(times, (time) =>
    formatSgt({ date: time, pattern: "yyyy-MM-dd" })
  );
  assert.ok(Object.values(perDay).every((count) => count <= 2));

  const redditDays = placed
    .filter((row) => row.platformId === "reddit")
    .map((row) => formatSgt({ date: row.proposed, pattern: "yyyy-MM-dd" }));
  assert.equal(new Set(redditDays).size, redditDays.length);

  const lastOfWave = (wave: number | undefined) =>
    Math.max(
      ...placed
        .filter((row) => row.wave === wave)
        .map((row) => row.proposed.getTime())
    );
  const firstOfWave = (wave: number | undefined) =>
    Math.min(
      ...placed
        .filter((row) => row.wave === wave)
        .map((row) => row.proposed.getTime())
    );
  assert.ok(lastOfWave(2) < firstOfWave(3));
  assert.ok(lastOfWave(3) < firstOfWave(undefined));
});

test("proposes the same plan again once it is applied", () => {
  const first = plan({
    posts: buildPosts({ scheduledBy: "user" }),
    includeUserPlaced: true,
  });
  const applied = buildPosts({ scheduledBy: "planner" }).map((post) => {
    const row = first.find((entry) => entry.postId === post.id);
    return row?.kind === "moved" || row?.kind === "unchanged"
      ? { ...post, scheduledAt: row.proposed }
      : post;
  });
  const second = plan({ posts: applied, includeUserPlaced: false });
  assert.ok(
    second.every((row) => row.kind === "unchanged" || row.kind === "pinned")
  );
});

test("skips skipped posts and treats posted ones as fixed", () => {
  const posts = buildPosts({ scheduledBy: "planner" }).map((post) =>
    post.id === "x-features" ? { ...post, status: "skipped" } : post
  );
  const rows = plan({ posts, includeUserPlaced: false });
  assert.equal(
    rows.find((row) => row.postId === "x-features"),
    undefined
  );
  assert.ok(rows.every((row) => !row.postId.endsWith("-promo")));
});

function buildPost(options: {
  id: string;
  platformId: PlannerPost["platformId"];
  scheduledAt?: Date;
  scheduledBy?: PlannerPost["scheduledBy"];
  wave?: number;
  notBefore?: Date;
  notAfter?: Date;
}): PlannerPost {
  return {
    id: options.id,
    platformId: options.platformId,
    status: options.scheduledAt === undefined ? "draft" : "scheduled",
    scheduledAt: options.scheduledAt,
    scheduledBy: options.scheduledBy ?? "user",
    wave: options.wave,
    notBefore: options.notBefore,
    notAfter: options.notAfter,
  };
}

function getProposed(options: { rows: PlanRow[]; postId: string }) {
  const row = options.rows.find((entry) => entry.postId === options.postId);
  return row?.kind === "moved" || row?.kind === "unchanged"
    ? row.proposed
    : undefined;
}

test("places a draft without a time even when it has never been planned", () => {
  const rows = plan({
    posts: [buildPost({ id: "draft", platformId: "instagram", wave: 3 })],
    includeUserPlaced: false,
  });
  assert.equal(rows.at(0)?.kind, "moved");
});

test("places movable wave 1 posts before wave 2", () => {
  const rows = plan({
    posts: [
      buildPost({ id: "features", platformId: "instagram", wave: 2 }),
      buildPost({ id: "promo", platformId: "x", wave: 1 }),
    ],
    includeUserPlaced: false,
  });
  const promo = getProposed({ rows, postId: "promo" });
  const features = getProposed({ rows, postId: "features" });
  assert.ok(promo !== undefined && features !== undefined);
  assert.ok(promo.getTime() < features.getTime());
});

test("holds later waves behind a wave 1 post placed by hand", () => {
  const promoAt = new Date("2026-11-07T04:00:00Z");
  const rows = plan({
    posts: [
      buildPost({
        id: "promo",
        platformId: "x",
        scheduledAt: promoAt,
        wave: 1,
      }),
      buildPost({ id: "features", platformId: "instagram", wave: 2 }),
    ],
    includeUserPlaced: false,
  });
  const features = getProposed({ rows, postId: "features" });
  assert.ok(features !== undefined && features.getTime() > promoAt.getTime());
});

test("places a post no earlier than its own notBefore without holding later waves", () => {
  const notBefore = new Date("2026-11-12T16:00:00Z");
  const rows = plan({
    posts: [
      buildPost({ id: "late", platformId: "linkedin", wave: 1, notBefore }),
      buildPost({ id: "features", platformId: "instagram", wave: 2 }),
    ],
    includeUserPlaced: false,
  });
  const late = getProposed({ rows, postId: "late" });
  const features = getProposed({ rows, postId: "features" });
  assert.ok(late !== undefined && late.getTime() >= notBefore.getTime());
  assert.ok(features !== undefined && features.getTime() < notBefore.getTime());
});

test("places an event's reminders on the day before and its posts on the day, or leaves them unplaced", () => {
  const eventPlan = {
    ...DEFAULT_CAMPAIGN_PLAN,
    kind: "event" as const,
    startDate: "2026-11-03",
    eventDate: "2026-11-10",
  };
  const platformIds = ["x", "threads", "linkedin"] as const;
  const posts = [1, 2].flatMap((wave) =>
    platformIds.map((platformId) => ({
      ...buildPost({ id: `${platformId}-${wave}`, platformId, wave }),
      ...getPostWindow({ plan: eventPlan, platformId, wave }),
    }))
  );
  const rows = planCampaignSchedule({
    posts,
    plan: eventPlan,
    heat: HEAT,
    now: NOW,
    includeUserPlaced: false,
    reposts: [],
  });
  const days = Object.fromEntries(
    rows.map((row) => {
      const time = getTime(row);
      return [
        row.postId,
        time === undefined
          ? row.kind
          : formatSgt({ date: time, pattern: "yyyy-MM-dd" }),
      ];
    })
  );
  assert.deepEqual(days, {
    "x-1": "2026-11-09",
    "threads-1": "2026-11-09",
    "linkedin-1": "unplaced",
    "x-2": "2026-11-10",
    "threads-2": "2026-11-10",
    "linkedin-2": "unplaced",
  });
});

test("keeps planned posts clear of reposts", () => {
  const free = plan({
    posts: buildPosts({ scheduledBy: "planner" }),
    includeUserPlaced: false,
  });
  const first = free.find((row) => row.kind === "moved");
  assert.ok(first?.kind === "moved");
  const rows = plan({
    posts: buildPosts({ scheduledBy: "planner" }),
    includeUserPlaced: false,
    reposts: [{ at: first.proposed, platformId: "x" }],
  });
  assert.ok(
    rows.every(
      (row) =>
        row.kind !== "moved" ||
        row.proposed.getTime() !== first.proposed.getTime()
    )
  );
});
