import uniqBy from "lodash/uniqBy.js";

import type {
  SkippedPlatform,
  SmartCampaignLanguage,
  SmartCampaignMedia,
  SmartCampaignSlot,
  SmartCampaignWave,
} from "./build-smart-campaign-plan";
import { CAMPAIGN_KIND_LABEL, type CampaignKind } from "./campaign-plan";
import { formatSgt } from "./format-sgt";
import type { RepostGap } from "./get-repost-gaps";
import { type PlatformId, PLATFORMS } from "./platforms";
import { REPOST_MODE_LABEL, REPOST_STRATEGY } from "./repost-strategy";
import { sgtToUtc } from "./sgt-to-utc";
import { VOICE_RULES } from "./voice-rules";

type PlatformAudience = {
  hashtags: { min: number; max: number };
  audience: { en: string; zh: string };
};

const LANGUAGE_LABEL = {
  en: "English",
  zh: "中文 (Simplified Chinese)",
} as const satisfies { [language in SmartCampaignLanguage]: string };

const MEDIA_LABEL = {
  promo: "the promo video",
  features: "the features video",
  images: "the image set",
  none: "no media",
} as const satisfies { [media in SmartCampaignMedia]: string };

const SCHEMA = `{
  "campaign": {
    "name": string,      // the campaign name, e.g. "<product> launch"
    "tagline": string    // one line in English, no more than 60 characters
  },
  "posts": [
    {
      "ref": string,          // exactly the ref from the list above
      "platform": string,     // the platform id from the list above, e.g. "x"
      "wave": number,         // the wave from the list above
      "kind": "post" | "reply" | "comment",
      "parent_ref": string,   // only for a reply or comment: the ref it belongs to
      "language": "en" | "zh",
      "title": string,        // only where the platform has a title
      "body": string,         // the text to paste, without the hashtags
      "hashtags": string[],   // without "#"; [] when there are none
      "target": string,       // only for Reddit (the subreddit, "r/Name") and Threads (one topic or community)
      "media": "promo" | "features" | "images" | "none",
      "why": string           // one line: the idea of this post
    }
  ]
}`;

function getPlatformRules(platformId: PlatformId) {
  switch (platformId) {
    case "producthunt":
      return [
        "The tagline goes in `title`, the description in `body`.",
        "The maker's first comment is its own post with kind `comment`.",
      ];
    case "x":
      return [
        "X counts any link as 23 characters and an emoji as 2.",
        "No link in a main post: X shows posts with links to fewer people. The link goes in reply 1.",
        "The first line has to work alone; it is all most people see.",
      ];
    case "threads":
      return [
        "Choose one topic or community for each post and put it in `target`.",
        "The first line has to work alone; it is all most people see in the feed.",
      ];
    case "instagram":
      return [
        "Links in captions are not clickable: say “link in bio” instead.",
        "The hook goes in the first 125 characters, before “more”.",
      ];
    case "tiktok":
      return [
        "The caption is cut after one line, so the hook goes first.",
        "Links are not clickable: say “link in bio”.",
      ];
    case "reddit":
      return [
        "Choose a different subreddit for each post that suits the product, and put it in `target` as r/Name.",
        "Every post needs a `title`. No hashtags: they read as spam on Reddit.",
        "Write as the maker talking to the subreddit, honest and plain, with no marketing tone.",
      ];
    case "xiaohongshu":
      return [
        "标题 goes in `title`, at most 20 characters; the feed shows only the cover and the 标题.",
        "话题 go in `hashtags`, not in `body`.",
        "Links are not clickable; the domain may go at the end of the text as plain text.",
      ];
    case "wechat_channels":
      return [
        "A short why in the first line: the description is cut after one line.",
      ];
    case "wechat_moments":
      return [
        "Links in 朋友圈 text are not clickable: the link goes in the first comment.",
        "The point fits in the first 6 lines; 朋友圈 folds longer text behind 全文.",
      ];
    case "youtube":
      return ["The link goes in the description (`body`)."];
    case "linkedin":
      return [
        "No link in the post: LinkedIn shows posts with outside links to fewer people. The link goes in the first comment.",
        "Open with one short line; LinkedIn folds the post after about 210 characters.",
      ];
    case "bluesky":
      return [
        "At most 300 characters, and a link counts in full.",
        "The link can go in the post itself.",
      ];
    default: {
      const unhandled: never = platformId;
      return unhandled;
    }
  }
}

function describePlatform(options: {
  platformId: PlatformId;
  languages: readonly SmartCampaignLanguage[];
  preflight: PlatformAudience;
}) {
  const platform = PLATFORMS[options.platformId];
  const bodyLimit: number | undefined = platform.bodyLimit;
  const titleLimit: number | undefined = platform.titleLimit;
  const hashtags = options.preflight.hashtags;
  const lines = [
    titleLimit === undefined
      ? undefined
      : `Title: at most ${titleLimit} characters.`,
    bodyLimit === undefined
      ? "Text: no hard limit; keep it as short as the idea needs."
      : `Text: at most ${bodyLimit} characters, hashtags included.`,
    hashtags.max === 0
      ? "Hashtags: none."
      : `Hashtags: ${hashtags.min === 0 ? `up to ${hashtags.max}` : `${hashtags.min} to ${hashtags.max}`}.`,
    ...getPlatformRules(options.platformId),
    `Who reads it: ${options.preflight.audience.en}.`,
  ].filter((line) => line !== undefined);
  return `### ${platform.label} (\`${platform.id}\`) · ${options.languages.map((language) => LANGUAGE_LABEL[language]).join(", ")}
${lines.map((line) => `- ${line}`).join("\n")}`;
}

function formatDay(day: string) {
  return formatSgt({
    date: sgtToUtc({ date: day, time: "00:00" }),
    pattern: "EEE dd MMM",
  });
}

function describeSlot(slot: SmartCampaignSlot) {
  const platform = PLATFORMS[slot.platformId];
  const kind =
    slot.parentRef === undefined
      ? "post"
      : `${slot.kind} to \`${slot.parentRef}\``;
  const notBefore =
    slot.notBefore === undefined || slot.parentRef !== undefined
      ? ""
      : ` · not before ${formatDay(slot.notBefore)}`;
  return `- \`${slot.ref}\` · ${platform.label} ${kind} · ${slot.language} · media: ${slot.media}${slot.optional ? " · optional" : ""}${notBefore}. ${slot.brief}`;
}

function getOpening(options: { kind: CampaignKind; product: string }) {
  switch (options.kind) {
    case "launch":
      return `I'm launching ${options.product}, and I'd like you to write every post for the launch.`;
    case "follow-up":
      return `I'm running another campaign for ${options.product}, and I'd like you to write every post for it.`;
    case "feature-update":
      return `I shipped something new in ${options.product}, and I'd like you to write every post about it.`;
    case "event":
      return `I'm posting about ${options.product} for a date that matters, and I'd like you to write every post for it.`;
    default: {
      const unhandled: never = options.kind;
      return unhandled;
    }
  }
}

function getKindLine(options: {
  kind: CampaignKind;
  eventDate: string | undefined;
}) {
  switch (options.kind) {
    case "launch":
      return "This is the first time I introduce the product.";
    case "follow-up":
      return "Readers may have seen the launch. Don't reintroduce the product or reuse the earlier first lines below. Lead with the focus above.";
    case "feature-update":
      return "Something new shipped. Readers may know the product already: lead with what changed, not with what the product is, and don't reuse the earlier first lines below.";
    case "event":
      return `This campaign is about a date${options.eventDate === undefined ? "" : ` (${formatDay(options.eventDate)})`}. A reminder goes out the day before and the main posts on the day. Don't reintroduce the product from scratch.`;
    default: {
      const unhandled: never = options.kind;
      return unhandled;
    }
  }
}

function describeGap(options: {
  gap: RepostGap;
  skip: SkippedPlatform | undefined;
}) {
  const gap = options.gap;
  switch (gap.kind) {
    case "no-history":
      return "No earlier post tracked by CC.";
    case "ready":
      return `Last post ${gap.daysSince} days before the start: fine to post again with a new angle.`;
    case "wait":
    case "after-window":
      return options.skip !== undefined
        ? `Last post ${gap.daysSince} days before the start: not past the gap until ${formatDay(gap.readyOn)}, so it is left out of this campaign.`
        : `Last post ${gap.daysSince} days before the start: wait until ${formatDay(gap.readyOn)}; its first post goes out on or after that day.`;
    default: {
      const unhandled: never = gap;
      return unhandled;
    }
  }
}

function describeRepost(options: {
  gap: RepostGap;
  skip: SkippedPlatform | undefined;
}) {
  const platformId = options.gap.platformId;
  const strategy = REPOST_STRATEGY[platformId];
  const status =
    options.skip?.reason === "kind"
      ? "Not part of this kind of campaign; left out."
      : describeGap(options);
  return `- ${PLATFORMS[platformId].label} · ${REPOST_MODE_LABEL[strategy.mode]} · at least ${strategy.minGapDays} days apart · ${strategy.confidence === "sourced" ? "sourced" : "common practice"}. ${strategy.how} ${status}`;
}

function buildExample(slots: readonly SmartCampaignSlot[]) {
  const first = slots.find((slot) => slot.parentRef === undefined);
  const child = slots.find(
    (slot) => first !== undefined && slot.parentRef === first.ref
  );
  const toPost = (slot: SmartCampaignSlot) => ({
    ref: slot.ref,
    platform: slot.platformId,
    wave: slot.wave,
    kind: slot.kind,
    ...(slot.parentRef === undefined ? {} : { parent_ref: slot.parentRef }),
    language: slot.language,
    ...(PLATFORMS[slot.platformId].titleLimit === undefined
      ? {}
      : { title: "…" }),
    body: "…",
    hashtags: [],
    ...(slot.platformId === "reddit" || slot.platformId === "threads"
      ? { target: "…" }
      : {}),
    media: slot.media,
    why: "…",
  });
  return JSON.stringify(
    {
      campaign: { name: "…", tagline: "…" },
      posts: [first, child].flatMap((slot) =>
        slot === undefined ? [] : [toPost(slot)]
      ),
    },
    null,
    2
  );
}

/** Return the prompt that asks ChatGPT to write every post in `plan.slots` in the owner's voice and reply with one JSON block, with the campaign's `kind` and `intent`, `earlierPosts` and `history`, and each `repostGaps` platform's repost rule and gap. */
export function buildSmartCampaignPrompt(options: {
  kind: CampaignKind;
  intent: string;
  eventDate: string | undefined;
  product: { name: string; link: string };
  thoughts: string;
  makersNote: string;
  earlierPosts: string;
  history: string;
  startDate: string;
  lengthDays: number;
  media: {
    promo: boolean;
    features: boolean;
    images: boolean;
    notes: string;
    newMedia: string;
  };
  plan: {
    waves: readonly SmartCampaignWave[];
    slots: readonly SmartCampaignSlot[];
    skipped: readonly SkippedPlatform[];
  };
  repostGaps: readonly RepostGap[];
  preflight: { [id in PlatformId]: PlatformAudience };
}) {
  const product = options.product.name.trim();
  const link = options.product.link.trim();
  const slots = options.plan.slots;
  const platforms = uniqBy(slots, (slot) => slot.platformId).map(
    (slot) => slot.platformId
  );
  const languages = new Set(slots.map((slot) => slot.language));
  const voiceRules = (language: SmartCampaignLanguage) =>
    VOICE_RULES.filter((rule) => rule.language === language)
      .map((rule) => `- ${rule.instruction}`)
      .join("\n");
  const makersNote = options.makersNote.trim();
  const mediaNotes = options.media.notes.trim();
  const newMedia = options.media.newMedia.trim();
  const intent = options.intent.trim();
  const earlierPosts = options.earlierPosts.trim();
  const history = options.history.trim();
  const purpose =
    options.kind === "launch" && intent === ""
      ? ""
      : `
## What this campaign is for
${CAMPAIGN_KIND_LABEL[options.kind]}.${intent === "" ? "" : `\n"""\n${intent}\n"""`}
${getKindLine({ kind: options.kind, eventDate: options.eventDate })}
`;
  const workedBefore =
    earlierPosts === "" && history === ""
      ? ""
      : `
## What worked before
${earlierPosts === "" ? "" : `### Earlier posts (from me)\n"""\n${earlierPosts}\n"""\n\n`}${history === "" ? "" : `### Tracked by CC (24 h views, best first)\n${history}\n\n`}Lean into what worked; never repeat an earlier first line.
`;

  return `I'm Yuxuan. I make small things on the Internet. ${getOpening({ kind: options.kind, product: `${product}${link === "" ? "" : ` (${link})`}` })} They should sound like me, not like marketing and not like AI.

The campaign runs ${options.lengthDays} days from ${options.startDate} (Singapore time). I post by hand; CC, my planner, picks the times.
${purpose}
## How I think about it, in my own words
"""
${options.thoughts.trim()}
"""
${
  makersNote === ""
    ? ""
    : `
## My maker's note, in my own words
"""
${makersNote}
"""
`
}
Use my words above as the reference for both the voice and the ideas. Borrow my phrases and small details. Don't invent features or promises I don't mention.
${workedBefore}
## Media I have
- Promo video: ${options.media.promo ? "yes" : "no"}
- Features video: ${options.media.features ? "yes" : "no"}
- Image set: ${options.media.images ? "yes" : "no"}${mediaNotes === "" ? "" : `\n- Notes: ${mediaNotes}`}${newMedia === "" ? "" : `\n- New for this campaign: ${newMedia}`}

## How I write
- First person, plain words, one honest feeling, uneven sentence lengths.
- Specific small moments over big claims. The why comes before the features.
- A small emoji or emoticon now and then is fine; no feature lists, no big promises.
${voiceRules("en")}${
    languages.has("zh")
      ? `

中文帖子：
${voiceRules("zh")}`
      : ""
  }

Write each post in the language given for it. A 中文 post is written in Chinese from the start, not translated from the English one.

## Platform rules
${platforms
  .map((platformId) =>
    describePlatform({
      platformId,
      languages: [
        ...new Set(
          slots
            .filter((slot) => slot.platformId === platformId)
            .map((slot) => slot.language)
        ),
      ],
      preflight: options.preflight[platformId],
    })
  )
  .join("\n\n")}

## When and how to post again
${options.repostGaps
  .map((gap) =>
    describeRepost({
      gap,
      skip: options.plan.skipped.find(
        (entry) => entry.platformId === gap.platformId
      ),
    })
  )
  .join("\n")}

## The posts to write
Write exactly these posts, one object each, with the same \`ref\`, \`platform\`, \`wave\`, \`kind\`, \`parent_ref\`, \`language\` and \`media\` as listed. You may leave out a post marked optional. Each post in a wave says something different from the others; don't paste the same text across platforms.

${options.plan.waves
  .map((wave) => ({
    wave,
    slots: slots.filter((slot) => slot.wave === wave.wave),
  }))
  .filter((entry) => entry.slots.length > 0)
  .map(
    (entry) =>
      `### ${entry.wave.title} (${MEDIA_LABEL[entry.wave.media]})\n${entry.slots.map(describeSlot).join("\n")}`
  )
  .join("\n\n")}

## Output format
Reply with one \`\`\`json fenced block and nothing else. One short line before the block is fine; nothing after it. The JSON follows this schema (the // notes are for you; don't put comments in the JSON):

${SCHEMA}

Leave out \`parent_ref\`, \`title\` and \`target\` where they don't apply. Use straight double quotes, \\n for line breaks inside strings, and no trailing commas.

Example of the shape:
\`\`\`json
${buildExample(slots)}
\`\`\``;
}
