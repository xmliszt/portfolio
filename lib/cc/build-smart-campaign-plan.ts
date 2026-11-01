import type { PlatformId } from "./platforms";

export type SmartCampaignLanguage = "en" | "zh";

export type SmartCampaignMedia = "promo" | "features" | "images" | "none";

export type SmartCampaignPostKind = "post" | "reply" | "comment";

/** One post the smart campaign asks ChatGPT to write, matched to the reply by `ref`. */
export type SmartCampaignSlot = {
  ref: string;
  platformId: PlatformId;
  wave: number;
  kind: SmartCampaignPostKind;
  parentRef: string | undefined;
  language: SmartCampaignLanguage;
  media: SmartCampaignMedia;
  /** `true` if ChatGPT may leave this post out; `false` when the plan needs it. */
  optional: boolean;
  brief: string;
};

/** One wave of a smart campaign: its number, the media it goes out with, its heading, and what its posts say. */
export type SmartCampaignWave = {
  wave: number;
  media: SmartCampaignMedia;
  title: string;
  brief: string;
};

const VIDEO_ONLY = new Set<PlatformId>([
  "tiktok",
  "wechat_channels",
  "youtube",
]);
const MEDIA_REQUIRED = new Set<PlatformId>(["instagram", "xiaohongshu"]);
const LAUNCH_ONLY = new Set<PlatformId>(["producthunt", "wechat_moments"]);
const X_LAUNCH_REPLY_COUNT = 3;
const REDDIT_POST_COUNT = 3;
const REDDIT_REQUIRED_COUNT = 2;

function getWaves(media: {
  promo: boolean;
  features: boolean;
  images: boolean;
}): SmartCampaignWave[] {
  const launchMedia = media.promo ? "promo" : media.images ? "images" : "none";
  return [
    {
      wave: 1,
      media: launchMedia,
      title: "Wave 1 · launch",
      brief: "Launch post: why it exists first, then what it is.",
    },
    ...(media.features
      ? [
          {
            wave: 2,
            media: "features" as const,
            title: "Wave 2 · a closer look",
            brief:
              "A closer look: one or two things you can do inside, as the features video shows them.",
          },
        ]
      : []),
    ...(media.images && launchMedia !== "images"
      ? [
          {
            wave: 3,
            media: "images" as const,
            title: "Wave 3 · images",
            brief: "Image post: one small moment the images show.",
          },
        ]
      : []),
  ];
}

function getPlatformWaves(options: {
  platformId: PlatformId;
  waves: readonly SmartCampaignWave[];
}) {
  return options.waves.filter((wave) => {
    if (LAUNCH_ONLY.has(options.platformId)) return wave.wave === 1;
    if (VIDEO_ONLY.has(options.platformId)) {
      return wave.media === "promo" || wave.media === "features";
    }
    if (MEDIA_REQUIRED.has(options.platformId)) return wave.media !== "none";
    return true;
  });
}

function buildRedditSlots(options: {
  waves: readonly SmartCampaignWave[];
  language: SmartCampaignLanguage;
}) {
  return Array.from(
    { length: REDDIT_POST_COUNT },
    (_, index): SmartCampaignSlot => ({
      ref: `reddit-${index + 1}`,
      platformId: "reddit",
      wave:
        options.waves.at(Math.min(index, options.waves.length - 1))?.wave ?? 1,
      kind: "post",
      parentRef: undefined,
      language: options.language,
      media:
        index === 0 && options.waves.at(0)?.media === "promo"
          ? "promo"
          : "none",
      optional: index >= REDDIT_REQUIRED_COUNT,
      brief:
        index === 0
          ? "A post for a subreddit you choose: title and body, written as the maker, fit to that subreddit's rules."
          : "A post for a different subreddit you choose, with its own title and body, not a copy of the others.",
    })
  );
}

function buildPlatformSlots(options: {
  platformId: PlatformId;
  language: SmartCampaignLanguage;
  waves: readonly SmartCampaignWave[];
  hasImages: boolean;
}) {
  return getPlatformWaves(options).flatMap((wave): SmartCampaignSlot[] => {
    const ref = `${options.platformId.replaceAll("_", "-")}-${wave.wave}`;
    const post: SmartCampaignSlot = {
      ref,
      platformId: options.platformId,
      wave: wave.wave,
      kind: "post",
      parentRef: undefined,
      language: options.language,
      media: wave.media,
      optional: false,
      brief: wave.brief,
    };
    function child(fields: Pick<SmartCampaignSlot, "ref" | "kind" | "brief">) {
      return { ...post, ...fields, parentRef: ref, media: "none" as const };
    }
    switch (options.platformId) {
      case "x":
        return [
          { ...post, brief: `${wave.brief} No link in this post.` },
          ...Array.from(
            { length: wave.wave === 1 ? X_LAUNCH_REPLY_COUNT : 1 },
            (_, index) =>
              child({
                ref: `${ref}-reply-${index + 1}`,
                kind: "reply",
                brief:
                  index === 0
                    ? "Reply 1: the link, with one line that adds something."
                    : `Reply ${index + 1}: one more small detail, different from the other replies.`,
              })
          ),
        ];
      case "linkedin":
        return [
          { ...post, brief: `${wave.brief} No link in this post.` },
          child({
            ref: `${ref}-comment`,
            kind: "comment",
            brief: "First comment: the link, with one short line.",
          }),
        ];
      case "wechat_moments":
        return [
          { ...post, brief: `${wave.brief} No link in this post.` },
          child({
            ref: `${ref}-comment`,
            kind: "comment",
            brief: "First comment: the link, with one short line.",
          }),
        ];
      case "producthunt":
        return [
          {
            ...post,
            media: options.hasImages ? "images" : wave.media,
            brief:
              "The Product Hunt listing: the tagline goes in `title`, the description in `body`.",
          },
          child({
            ref: `${ref}-comment`,
            kind: "comment",
            brief:
              "The maker's first comment: why I made it, in my words, then what is inside, then a thank you.",
          }),
        ];
      case "youtube":
        return [
          {
            ...post,
            brief: `Title and description for the ${wave.media === "promo" ? "promo" : "features"} video, with the link in the description.`,
          },
        ];
      case "threads":
      case "instagram":
      case "tiktok":
      case "reddit":
      case "xiaohongshu":
      case "wechat_channels":
        return [post];
      default: {
        const unhandled: never = options.platformId;
        return unhandled;
      }
    }
  });
}

/** Return the posts a smart campaign asks for on each of `platforms`, by wave (1 launches with the promo video, 2 takes a closer look when a features video exists, 3 posts the images when they exist), with each platform's replies and comments, the waves, and the platforms that get no post because they need media that does not exist. */
export function buildSmartCampaignPlan(options: {
  platforms: readonly {
    platformId: PlatformId;
    language: SmartCampaignLanguage;
  }[];
  media: { promo: boolean; features: boolean; images: boolean };
}) {
  const waves = getWaves(options.media);
  const perPlatform = options.platforms.map((platform) => ({
    platformId: platform.platformId,
    slots:
      platform.platformId === "reddit"
        ? buildRedditSlots({ waves, language: platform.language })
        : buildPlatformSlots({
            ...platform,
            waves,
            hasImages: options.media.images,
          }),
  }));
  return {
    waves,
    slots: perPlatform.flatMap((entry) => entry.slots),
    skipped: perPlatform.flatMap((entry) =>
      entry.slots.length === 0 ? [entry.platformId] : []
    ),
  };
}
