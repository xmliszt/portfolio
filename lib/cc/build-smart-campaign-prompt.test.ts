import mapValues from "lodash/mapValues.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { PAWS_SMART_CAMPAIGN } from "./testing/paws-smart-campaign";
import { buildSmartCampaignPlan } from "./build-smart-campaign-plan";
import { buildSmartCampaignPrompt } from "./build-smart-campaign-prompt";
import { parseSmartCampaignResponse } from "./parse-smart-campaign-response";
import { PLATFORMS } from "./platforms";
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
