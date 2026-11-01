import mapValues from "lodash/mapValues.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildHistoryPost } from "./testing/build-history-post";
import { LAUNDRO_FOLLOW_UP_CAMPAIGN } from "./testing/laundro-follow-up-campaign";
import { PAWS_SMART_CAMPAIGN } from "./testing/paws-smart-campaign";
import { buildSmartCampaignPlan } from "./build-smart-campaign-plan";
import { buildSmartCampaignPrompt } from "./build-smart-campaign-prompt";
import { getRepostGaps } from "./get-repost-gaps";
import { parseSmartCampaignResponse } from "./parse-smart-campaign-response";
import { PLATFORMS } from "./platforms";
import { summariseCampaignHistory } from "./summarise-campaign-history";
import { VOICE_RULES } from "./voice-rules";

const PREFLIGHT = mapValues(PLATFORMS, (platform) => ({
  hashtags: {
    min: platform.id === "xiaohongshu" ? 3 : 0,
    max: platform.maxHashtags,
  },
  audience: { en: `${platform.label} readers`, zh: `${platform.label} 读者` },
}));

function buildPrompt(options: {
  platforms: Parameters<typeof buildSmartCampaignPlan>[0]["platforms"];
}) {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: options.platforms,
    media: PAWS_SMART_CAMPAIGN.media,
  });
  return {
    plan,
    prompt: buildSmartCampaignPrompt({
      ...PAWS_SMART_CAMPAIGN,
      plan,
      preflight: PREFLIGHT,
    }),
  };
}

const PAWS_PLATFORMS = [
  { platformId: "x", language: "en" },
  { platformId: "threads", language: "en" },
  { platformId: "xiaohongshu", language: "zh" },
  { platformId: "linkedin", language: "en" },
  { platformId: "producthunt", language: "en" },
] as const;

test("lists every planned ref", () => {
  const { plan, prompt } = buildPrompt({ platforms: PAWS_PLATFORMS });
  for (const slot of plan.slots) {
    assert.ok(prompt.includes(`\`${slot.ref}\``), slot.ref);
  }
});

test("quotes the owner's words verbatim", () => {
  const { prompt } = buildPrompt({ platforms: PAWS_PLATFORMS });
  assert.ok(prompt.startsWith("I'm Yuxuan."));
  assert.ok(prompt.includes(`"""\n${PAWS_SMART_CAMPAIGN.thoughts}\n"""`));
  assert.ok(prompt.includes(`"""\n${PAWS_SMART_CAMPAIGN.makersNote}\n"""`));
  assert.ok(prompt.includes("14 days from 2026-11-03"));
});

test("leaves out the maker's note section when there is no note", () => {
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: "launch",
    repostGaps: [],
    platforms: [{ platformId: "x", language: "en" }],
    media: PAWS_SMART_CAMPAIGN.media,
  });
  const prompt = buildSmartCampaignPrompt({
    ...PAWS_SMART_CAMPAIGN,
    makersNote: "  ",
    plan,
    preflight: PREFLIGHT,
  });
  assert.ok(!prompt.includes("maker's note, in my own words"));
});

test("includes the voice rules, the Chinese ones only with a 中文 post", () => {
  const withChinese = buildPrompt({ platforms: PAWS_PLATFORMS }).prompt;
  for (const rule of VOICE_RULES) {
    assert.ok(withChinese.includes(rule.instruction), rule.id);
  }
  const englishOnly = buildPrompt({
    platforms: [{ platformId: "x", language: "en" }],
  }).prompt;
  for (const rule of VOICE_RULES) {
    assert.equal(
      englishOnly.includes(rule.instruction),
      rule.language === "en",
      rule.id
    );
  }
});

test("states each platform's limits and link rules", () => {
  const { prompt } = buildPrompt({ platforms: PAWS_PLATFORMS });
  for (const line of [
    "Text: at most 280 characters, hashtags included.",
    "X counts any link as 23 characters and an emoji as 2.",
    "The link goes in reply 1.",
    "Choose one topic or community for each post and put it in `target`.",
    "Title: at most 20 characters.",
    "Hashtags: 3 to 8.",
    "The link goes in the first comment.",
    "Title: at most 60 characters.",
  ]) {
    assert.ok(prompt.includes(line), line);
  }
});

test("ends with the schema and an example the parser reads", () => {
  const { plan, prompt } = buildPrompt({ platforms: PAWS_PLATFORMS });
  for (const key of [
    '"campaign"',
    '"tagline"',
    '"posts"',
    '"ref"',
    '"parent_ref"',
    '"hashtags"',
    '"target"',
    '"media"',
    '"why"',
  ]) {
    assert.ok(prompt.includes(key), key);
  }
  assert.ok(prompt.endsWith("```"));
  const example = parseSmartCampaignResponse(
    prompt.slice(prompt.lastIndexOf("```json"))
  );
  assert.equal(example.kind, "ok");
  assert.deepEqual(
    example.kind === "ok" ? example.posts.map((post) => post.ref) : [],
    plan.slots.slice(0, 2).map((slot) => slot.ref)
  );
});

test("frames a follow-up by its intent, earlier posts, tracked history and repost gaps", () => {
  const campaign = { ...LAUNDRO_FOLLOW_UP_CAMPAIGN, lengthDays: 45 };
  const posts = [
    buildHistoryPost({
      platformId: "x",
      at: "2026-10-20T13:00:00Z",
      firstLine: "I opened a laundromat on the Internet",
      views24h: 240,
    }),
    buildHistoryPost({
      platformId: "linkedin",
      at: "2026-10-20T13:00:00Z",
      firstLine: "I made a small laundromat",
    }),
  ];
  const repostGaps = getRepostGaps({
    posts,
    platformIds: campaign.platforms.map((platform) => platform.platformId),
    startDate: campaign.startDate,
    lengthDays: campaign.lengthDays,
  });
  const plan = buildSmartCampaignPlan({
    eventDate: undefined,
    kind: campaign.kind,
    platforms: campaign.platforms,
    media: campaign.media,
    repostGaps,
  });
  const prompt = buildSmartCampaignPrompt({
    ...campaign,
    history: summariseCampaignHistory({
      posts,
      platformIds: campaign.platforms.map((platform) => platform.platformId),
    }),
    plan,
    repostGaps,
    preflight: PREFLIGHT,
  });
  assert.ok(prompt.startsWith("I'm Yuxuan."));
  assert.ok(!prompt.includes("I'm launching"));
  assert.ok(
    prompt.includes(
      `## What this campaign is for\nFollow-up.\n"""\n${campaign.intent}\n"""\nReaders may have seen the launch.`
    )
  );
  assert.ok(
    prompt.includes(
      `### Earlier posts (from me)\n"""\n${campaign.earlierPosts}\n"""`
    )
  );
  assert.ok(
    prompt.includes(
      `- 2026-10-20 · "I opened a laundromat on the Internet" · 240 views at 24 h, 2.4× median · no media`
    )
  );
  assert.ok(prompt.includes("never repeat an earlier first line"));
  assert.ok(
    prompt.includes("- X · quote or rewrite · at least 7 days apart · sourced.")
  );
  assert.ok(
    prompt.includes(
      "Last post 27 days before the start: fine to post again with a new angle."
    )
  );
  assert.ok(
    prompt.includes(
      "Last post 27 days before the start: wait until Sat 19 Dec; its first post goes out on or after that day."
    )
  );
  assert.ok(
    prompt.includes(
      "`linkedin-1` · LinkedIn post · en · media: images · not before Sat 19 Dec."
    )
  );
});
