import assert from "node:assert/strict";
import { test } from "node:test";

import { PAWS_CHATGPT_REPLY } from "./testing/paws-smart-campaign";
import { buildSmartCampaignPlan } from "./build-smart-campaign-plan";
import { matchSmartCampaignReply } from "./match-smart-campaign-reply";
import { parseSmartCampaignResponse } from "./parse-smart-campaign-response";

const plan = buildSmartCampaignPlan({
  eventDate: undefined,
  kind: "launch",
  repostGaps: [],
  platforms: [
    { platformId: "x", language: "en" },
    { platformId: "xiaohongshu", language: "zh" },
    { platformId: "linkedin", language: "en" },
    { platformId: "producthunt", language: "en" },
    { platformId: "reddit", language: "en" },
  ],
  media: { promo: true, features: false, images: false },
});

function parseReply(text: string) {
  const result = parseSmartCampaignResponse(text);
  return result.kind === "ok" ? result.posts : [];
}

test("lists the required refs the reply left out, but not optional ones", () => {
  const match = matchSmartCampaignReply({
    slots: plan.slots,
    posts: parseReply(PAWS_CHATGPT_REPLY),
  });
  assert.deepEqual(match.missingRefs, [
    "x-1-reply-2",
    "x-1-reply-3",
    "reddit-1",
    "reddit-2",
  ]);
  assert.deepEqual(match.extraRefs, []);
  assert.equal(match.drafts.length, 7);
  assert.ok(match.drafts.every((draft) => draft.isPlanned));
});

test("applies the plan's fields to planned refs and keeps extra posts last", () => {
  const match = matchSmartCampaignReply({
    slots: plan.slots,
    posts: parseReply(`\`\`\`json
{"posts": [
  {"ref": "x-9", "platform": "x", "wave": 4, "body": "An extra idea."},
  {"ref": "xiaohongshu-1", "platform": "xiaohongshu", "wave": 3, "language": "en", "media": "none", "title": "标题", "body": "正文"}
]}
\`\`\``),
  });
  assert.deepEqual(
    match.drafts.map((draft) => [
      draft.ref,
      draft.wave,
      draft.language,
      draft.media,
      draft.isPlanned,
    ]),
    [
      ["xiaohongshu-1", 1, "zh", "promo", true],
      ["x-9", 4, "en", "none", false],
    ]
  );
  assert.deepEqual(match.extraRefs, ["x-9"]);
});
