import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSmartCampaignPlan } from "./build-smart-campaign-plan";

const ALL_MEDIA = { promo: true, features: true, images: true };

test("plans three waves with X replies, LinkedIn comments and the Product Hunt comment", () => {
  const plan = buildSmartCampaignPlan({
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
  assert.deepEqual(plan.skipped, ["youtube", "tiktok"]);
});

test("gives YouTube one post per video and WeChat Moments one launch post with a comment", () => {
  const plan = buildSmartCampaignPlan({
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
