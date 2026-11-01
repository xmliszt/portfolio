import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSmartCampaignPlan } from "./build-smart-campaign-plan";

const ALL_MEDIA = { promo: true, features: true, images: true };

test("plans three waves with X replies, LinkedIn comments and the Product Hunt comment", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [
      { platformId: "x", language: "en" },
      { platformId: "xiaohongshu", language: "zh" },
      { platformId: "linkedin", language: "en" },
      { platformId: "producthunt", language: "en" },
    ],
    media: ALL_MEDIA,
  });
  assert.deepEqual(
    plan.slots.map((slot) => slot.ref),
    [
      "x-1",
      "x-1-reply-1",
      "x-1-reply-2",
      "x-1-reply-3",
      "x-2",
      "x-2-reply-1",
      "x-3",
      "x-3-reply-1",
      "xiaohongshu-1",
      "xiaohongshu-2",
      "xiaohongshu-3",
      "linkedin-1",
      "linkedin-1-comment",
      "linkedin-2",
      "linkedin-2-comment",
      "linkedin-3",
      "linkedin-3-comment",
      "producthunt-1",
      "producthunt-1-comment",
    ]
  );
  assert.deepEqual(plan.skipped, []);
  const reply = plan.slots.find((slot) => slot.ref === "x-1-reply-1");
  assert.equal(reply?.kind, "reply");
  assert.equal(reply?.parentRef, "x-1");
  assert.equal(reply?.wave, 1);
  assert.equal(
    plan.slots.find((slot) => slot.ref === "xiaohongshu-3")?.media,
    "images"
  );
  assert.equal(
    plan.slots.find((slot) => slot.ref === "xiaohongshu-1")?.language,
    "zh"
  );
  assert.equal(
    plan.slots.find((slot) => slot.ref === "producthunt-1")?.media,
    "images"
  );
});

test("leaves out wave 2 without a features video and wave 3 without images", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [{ platformId: "threads", language: "en" }],
    media: { promo: true, features: false, images: false },
  });
  assert.deepEqual(
    plan.waves.map((wave) => wave.wave),
    [1]
  );
  assert.deepEqual(
    plan.slots.map((slot) => slot.ref),
    ["threads-1"]
  );
});

test("launches with the images when there is no promo video", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [
      { platformId: "instagram", language: "en" },
      { platformId: "youtube", language: "en" },
      { platformId: "tiktok", language: "en" },
    ],
    media: { promo: false, features: false, images: true },
  });
  assert.deepEqual(
    plan.slots.map((slot) => `${slot.ref}:${slot.media}`),
    ["instagram-1:images"]
  );
  assert.deepEqual(
    plan.skipped.map((entry) => `${entry.platformId}:${entry.reason}`),
    ["youtube:no-media", "tiktok:no-media"]
  );
});

test("gives YouTube one post per video and WeChat Moments one launch post with a comment", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [
      { platformId: "youtube", language: "en" },
      { platformId: "wechat_moments", language: "zh" },
    ],
    media: ALL_MEDIA,
  });
  assert.deepEqual(
    plan.slots.map((slot) => slot.ref),
    ["youtube-1", "youtube-2", "wechat-moments-1", "wechat-moments-1-comment"]
  );
});

test("asks for three Reddit posts across the waves, the third optional", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [{ platformId: "reddit", language: "en" }],
    media: ALL_MEDIA,
  });
  assert.deepEqual(
    plan.slots.map((slot) => [slot.ref, slot.wave, slot.optional, slot.media]),
    [
      ["reddit-1", 1, false, "promo"],
      ["reddit-2", 2, false, "none"],
      ["reddit-3", 3, true, "none"],
    ]
  );
});

const ALL_PLATFORMS = [
  { platformId: "producthunt", language: "en" },
  { platformId: "x", language: "en" },
  { platformId: "threads", language: "en" },
  { platformId: "xiaohongshu", language: "zh" },
  { platformId: "wechat_moments", language: "zh" },
  { platformId: "linkedin", language: "en" },
  { platformId: "reddit", language: "en" },
] as const;

test("plans a follow-up without intro posts or Product Hunt", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "follow-up",
    platforms: ALL_PLATFORMS,
    media: ALL_MEDIA,
    repostGaps: [],
  });
  assert.deepEqual(
    plan.waves.map((wave) => wave.title),
    [
      "Wave 1 · the new angle",
      "Wave 2 · behind the scenes",
      "Wave 3 · from the people who use it",
    ]
  );
  const briefs = [
    ...plan.waves.map((wave) => wave.brief),
    ...plan.slots.map((slot) => slot.brief),
  ];
  for (const brief of briefs) {
    assert.ok(!/launch/i.test(brief), brief);
    assert.ok(!brief.includes("I made"), brief);
  }
  assert.ok(plan.slots.every((slot) => slot.platformId !== "producthunt"));
  assert.deepEqual(plan.skipped, [
    { platformId: "producthunt", reason: "kind" },
  ]);
  assert.deepEqual(
    plan.slots
      .filter((slot) => slot.platformId === "wechat_moments")
      .map((slot) => slot.ref),
    ["wechat-moments-1", "wechat-moments-1-comment"]
  );
  assert.deepEqual(
    plan.slots
      .filter((slot) => slot.platformId === "x" && slot.wave === 1)
      .map((slot) => slot.ref),
    ["x-1", "x-1-reply-1"]
  );
  assert.equal(
    plan.slots.find((slot) => slot.ref === "xiaohongshu-1")?.media,
    "images"
  );
});

test("keeps Product Hunt in a feature update only once its last launch is 180 days old", () => {
  const recent = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "feature-update",
    platforms: [{ platformId: "producthunt", language: "en" }],
    media: ALL_MEDIA,
    repostGaps: [
      {
        kind: "wait",
        platformId: "producthunt",
        minGapDays: 180,
        lastAt: new Date("2026-06-01T08:00:00Z"),
        daysSince: 168,
        readyOn: "2026-11-28",
      },
    ],
  });
  assert.deepEqual(recent.slots, []);
  assert.deepEqual(recent.skipped, [
    { platformId: "producthunt", reason: "repost-gap", readyOn: "2026-11-28" },
  ]);
  const old = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "feature-update",
    platforms: [{ platformId: "producthunt", language: "en" }],
    media: ALL_MEDIA,
    repostGaps: [
      {
        kind: "ready",
        platformId: "producthunt",
        minGapDays: 180,
        lastAt: new Date("2026-04-01T08:00:00Z"),
        daysSince: 229,
        readyOn: "2026-09-28",
      },
    ],
  });
  assert.deepEqual(
    old.slots.map((slot) => slot.ref),
    ["producthunt-1", "producthunt-1-comment"]
  );
});

test("holds a platform inside its repost gap and drops one whose gap ends after the window", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "follow-up",
    platforms: [
      { platformId: "linkedin", language: "en" },
      { platformId: "threads", language: "en" },
    ],
    media: ALL_MEDIA,
    repostGaps: [
      {
        kind: "wait",
        platformId: "linkedin",
        minGapDays: 60,
        lastAt: new Date("2026-10-15T12:00:00Z"),
        daysSince: 32,
        readyOn: "2026-12-14",
      },
      {
        kind: "after-window",
        platformId: "threads",
        minGapDays: 14,
        lastAt: new Date("2026-11-20T12:00:00Z"),
        daysSince: -4,
        readyOn: "2026-12-04",
      },
    ],
  });
  assert.ok(
    plan.slots.every(
      (slot) =>
        slot.platformId === "linkedin" && slot.notBefore === "2026-12-14"
    )
  );
  assert.deepEqual(plan.notBefore, { linkedin: "2026-12-14" });
  assert.deepEqual(plan.skipped, [
    { platformId: "threads", reason: "repost-gap", readyOn: "2026-12-04" },
  ]);
});

test("plans an event as a reminder the day before and the day itself, with WeChat Moments once on the day", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "event",
    platforms: [
      { platformId: "x", language: "en" },
      { platformId: "wechat_moments", language: "zh" },
      { platformId: "producthunt", language: "en" },
    ],
    media: ALL_MEDIA,
    repostGaps: [],
  });
  assert.deepEqual(
    plan.waves.map((wave) => wave.title),
    ["Wave 1 · the day before", "Wave 2 · on the day"]
  );
  assert.deepEqual(
    plan.slots.map((slot) => slot.ref),
    [
      "x-1",
      "x-1-reply-1",
      "x-2",
      "x-2-reply-1",
      "wechat-moments-2",
      "wechat-moments-2-comment",
    ]
  );
});

test("leaves a platform out of an event when its repost gap ends after the event day", () => {
  const plan = buildSmartCampaignPlan({
    kind: "event",
    eventDate: "2026-11-10",
    platforms: [{ platformId: "threads", language: "en" }],
    media: ALL_MEDIA,
    repostGaps: [
      {
        kind: "wait",
        platformId: "threads",
        minGapDays: 14,
        lastAt: new Date("2026-10-30T12:00:00Z"),
        daysSince: 4,
        readyOn: "2026-11-13",
      },
    ],
  });
  assert.deepEqual(plan.slots, []);
  assert.deepEqual(plan.skipped, [
    { platformId: "threads", reason: "repost-gap", readyOn: "2026-11-13" },
  ]);
});
