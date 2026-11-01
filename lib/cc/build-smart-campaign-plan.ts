import type { CampaignKind } from "./campaign-plan";
import type { RepostGap } from "./get-repost-gaps";
import { type PlatformId, PLATFORMS } from "./platforms";

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
  /** First SGT day ("yyyy-MM-dd") this post may go out on, or `undefined` when the campaign start is enough. */
  notBefore: string | undefined;
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
const ONCE_PER_CAMPAIGN = new Set<PlatformId>([
  "producthunt",
  "wechat_moments",
]);
const PRODUCT_HUNT_KINDS = new Set<CampaignKind>(["launch", "feature-update"]);
const X_LAUNCH_REPLY_COUNT = 3;
const REDDIT_POST_COUNT = 3;
const REDDIT_REQUIRED_COUNT = 2;

/** A platform the plan gives no post, and why. */
export type SkippedPlatform =
  | { platformId: PlatformId; reason: "no-media" | "kind" }
  | { platformId: PlatformId; reason: "repost-gap"; readyOn: string };

type MediaOwned = { promo: boolean; features: boolean; images: boolean };

function pickMedia(options: {
  media: MediaOwned;
  order: readonly Exclude<SmartCampaignMedia, "none">[];
}): SmartCampaignMedia {
  return options.order.find((media) => options.media[media]) ?? "none";
}

function getLaunchWaves(media: MediaOwned): SmartCampaignWave[] {
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

function getWaves(options: { kind: CampaignKind; media: MediaOwned }) {
  const media = options.media;
  switch (options.kind) {
    case "launch":
      return getLaunchWaves(media);
    case "follow-up":
    case "feature-update":
      return [
        options.kind === "follow-up"
          ? {
              wave: 1,
              media: pickMedia({
                media,
                order: ["images", "features", "promo"],
              }),
              title: "Wave 1 · the new angle",
              brief:
                "The focus of this campaign, as I describe it above. Readers may know the product already: open with the new angle, not with what the product is.",
            }
          : {
              wave: 1,
              media: pickMedia({
                media,
                order: ["features", "images", "promo"],
              }),
              title: "Wave 1 · what's new",
              brief:
                "The new feature, as I describe it above: what changed and the small reason behind it. Readers may know the product already: open with the change, not with what the product is.",
            },
        {
          wave: 2,
          media: pickMedia({ media, order: ["features", "images"] }),
          title: "Wave 2 · behind the scenes",
          brief:
            "Behind the scenes: one real detail of how the focus above was made.",
        },
        {
          wave: 3,
          media: pickMedia({ media, order: ["images"] }),
          title: "Wave 3 · from the people who use it",
          brief:
            "Social proof: what visitors made, wrote or replied, a number, or a short quote. Use only what I give you above; never invent quotes or numbers.",
        },
      ] satisfies SmartCampaignWave[];
    case "event":
      return [
        {
          wave: 1,
          media: pickMedia({ media, order: ["images"] }),
          title: "Wave 1 · the day before",
          brief:
            "A short reminder that goes out the day before: what is happening tomorrow and why it matters to the product.",
        },
        {
          wave: 2,
          media: pickMedia({ media, order: ["promo", "images", "features"] }),
          title: "Wave 2 · on the day",
          brief:
            "The post for the day itself: what this day means for the product, as I describe it above.",
        },
      ] satisfies SmartCampaignWave[];
    default: {
      const unhandled: never = options.kind;
      return unhandled;
    }
  }
}

function getPlatformWaves(options: {
  platformId: PlatformId;
  waves: readonly SmartCampaignWave[];
  onceWave: number;
}) {
  return options.waves.filter((wave) => {
    if (ONCE_PER_CAMPAIGN.has(options.platformId)) {
      return wave.wave === options.onceWave;
    }
    if (VIDEO_ONLY.has(options.platformId)) {
      return wave.media === "promo" || wave.media === "features";
    }
    if (MEDIA_REQUIRED.has(options.platformId)) return wave.media !== "none";
    return true;
  });
}

function buildRedditSlots(options: {
  kind: CampaignKind;
  waves: readonly SmartCampaignWave[];
  language: SmartCampaignLanguage;
  notBefore: string | undefined;
}) {
  return Array.from(
    { length: REDDIT_POST_COUNT },
    (_, index): SmartCampaignSlot => {
      const wave = options.waves.at(Math.min(index, options.waves.length - 1));
      const subreddit =
        index === 0
          ? "A post for a subreddit you choose: title and body, written as the maker, fit to that subreddit's rules."
          : "A post for a different subreddit you choose, with its own title and body, not a copy of the others.";
      return {
        ref: `reddit-${index + 1}`,
        platformId: "reddit",
        wave: wave?.wave ?? 1,
        kind: "post",
        parentRef: undefined,
        language: options.language,
        media:
          index === 0 && options.waves.at(0)?.media === "promo"
            ? "promo"
            : "none",
        optional: index >= REDDIT_REQUIRED_COUNT,
        brief:
          options.kind === "launch" || wave === undefined
            ? subreddit
            : `${wave.brief} ${subreddit}`,
        notBefore: options.notBefore,
      };
    }
  );
}

function buildPlatformSlots(options: {
  kind: CampaignKind;
  platformId: PlatformId;
  language: SmartCampaignLanguage;
  waves: readonly SmartCampaignWave[];
  onceWave: number;
  hasImages: boolean;
  notBefore: string | undefined;
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
      notBefore: options.notBefore,
    };
    function child(fields: Pick<SmartCampaignSlot, "ref" | "kind" | "brief">) {
      return { ...post, ...fields, parentRef: ref, media: "none" as const };
    }
    switch (options.platformId) {
      case "x":
        return [
          { ...post, brief: `${wave.brief} No link in this post.` },
          ...Array.from(
            {
              length:
                options.kind === "launch" && wave.wave === 1
                  ? X_LAUNCH_REPLY_COUNT
                  : 1,
            },
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
              options.kind === "launch"
                ? "The maker's first comment: why I made it, in my words, then what is inside, then a thank you."
                : "The maker's first comment: what is new and why, in my words, then a thank you.",
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

function getSkipReason(options: {
  kind: CampaignKind;
  eventDate: string | undefined;
  platformId: PlatformId;
  gap: RepostGap | undefined;
}): SkippedPlatform | undefined {
  const platformId = options.platformId;
  if (platformId === "producthunt" && !PRODUCT_HUNT_KINDS.has(options.kind)) {
    return { platformId, reason: "kind" };
  }
  const gap = options.gap;
  if (gap === undefined) return undefined;
  switch (gap.kind) {
    case "no-history":
    case "ready":
      return undefined;
    case "wait":
      return PLATFORMS[platformId].plannerPinned ||
        (options.eventDate !== undefined && gap.readyOn > options.eventDate)
        ? { platformId, reason: "repost-gap", readyOn: gap.readyOn }
        : undefined;
    case "after-window":
      return { platformId, reason: "repost-gap", readyOn: gap.readyOn };
    default: {
      const unhandled: never = gap;
      return unhandled;
    }
  }
}

/** Return the slots, waves, skipped platforms and per-platform `notBefore` days of a smart campaign of `kind` on `platforms`, leaving out a platform whose `repostGaps` entry ends after the window or after `eventDate`. */
export function buildSmartCampaignPlan(options: {
  kind: CampaignKind;
  platforms: readonly {
    platformId: PlatformId;
    language: SmartCampaignLanguage;
  }[];
  media: MediaOwned;
  repostGaps: readonly RepostGap[];
  /** The event day ("yyyy-MM-dd") of an event campaign, or `undefined` for other kinds. */
  eventDate: string | undefined;
}) {
  const waves = getWaves({ kind: options.kind, media: options.media });
  const onceWave = options.kind === "event" ? 2 : 1;
  const entries = options.platforms.map((platform) => {
    const gap = options.repostGaps.find(
      (entry) => entry.platformId === platform.platformId
    );
    const notBefore = gap?.kind === "wait" ? gap.readyOn : undefined;
    const skip = getSkipReason({
      kind: options.kind,
      eventDate: options.eventDate,
      platformId: platform.platformId,
      gap,
    });
    const slots =
      skip !== undefined
        ? []
        : platform.platformId === "reddit"
          ? buildRedditSlots({
              kind: options.kind,
              waves,
              language: platform.language,
              notBefore,
            })
          : buildPlatformSlots({
              ...platform,
              kind: options.kind,
              waves,
              onceWave,
              hasImages: options.media.images,
              notBefore,
            });
    return {
      platformId: platform.platformId,
      slots,
      skip:
        skip ??
        (slots.length === 0
          ? { platformId: platform.platformId, reason: "no-media" as const }
          : undefined),
      notBefore: slots.length === 0 ? undefined : notBefore,
    };
  });
  return {
    waves,
    slots: entries.flatMap((entry) => entry.slots),
    skipped: entries.flatMap((entry) =>
      entry.skip === undefined ? [] : [entry.skip]
    ),
    notBefore: Object.fromEntries(
      entries.flatMap((entry) =>
        entry.notBefore === undefined
          ? []
          : [[entry.platformId, entry.notBefore]]
      )
    ) satisfies { [id in PlatformId]?: string },
  };
}
