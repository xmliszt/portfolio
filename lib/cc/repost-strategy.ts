import type { PlatformId } from "./platforms";

export type RepostMode = "quote" | "recut" | "never";

export type RepostStrategy = {
  mode: RepostMode;
  /** Days to wait after the original before posting the idea again on this platform. */
  minGapDays: number;
  how: string;
  confidence: "sourced" | "common-practice";
  sources: readonly string[];
};

export const REPOST_STRATEGY = {
  x: {
    mode: "quote",
    minGapDays: 7,
    how: "Quote your own post with a new first line, or write a new post on the same idea. Never post the same text twice: X treats duplicate posts as spam.",
    confidence: "sourced",
    sources: [
      "https://help.x.com/en/rules-and-policies/twitter-automation",
      "https://techcrunch.com/2022/05/10/twitters-new-policy-highlights-its-efforts-to-combat-spam-and-duplicative-tweets/",
    ],
  },
  threads: {
    mode: "recut",
    minGapDays: 14,
    how: "A new post with a new opening line and, if you can, a different image or clip.",
    confidence: "common-practice",
    sources: [],
  },
  instagram: {
    mode: "recut",
    minGapDays: 30,
    how: "A re-cut: a new cover, a new first line, or a different clip. When identical content appears twice, Instagram recommends only the original.",
    confidence: "sourced",
    sources: [
      "https://www.gigazine.net/gsc_news/en/20240502-instagram-updated-algorithm-prioritizes-original-content",
      "https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/",
    ],
  },
  tiktok: {
    mode: "recut",
    minGapDays: 14,
    how: "A new edit of the clip with a new hook in the first second and a new caption.",
    confidence: "common-practice",
    sources: [],
  },
  linkedin: {
    mode: "recut",
    minGapDays: 60,
    how: "The same idea with a new opening line, 60 to 90 days later, once your audience has mostly turned over.",
    confidence: "common-practice",
    sources: [
      "https://www.agorapulse.com/blog/linkedin-marketing-tips/more-views-linkedin/",
      "https://posteverywhere.ai/glossary/evergreen-content",
    ],
  },
  reddit: {
    mode: "never",
    minGapDays: 30,
    how: "Don't repost in the same subreddit. Post to a different subreddit that fits, or come back with real news.",
    confidence: "common-practice",
    sources: [],
  },
  xiaohongshu: {
    mode: "recut",
    minGapDays: 14,
    how: "A new note with a new cover and a new angle, never the same note again.",
    confidence: "common-practice",
    sources: [],
  },
  wechat_channels: {
    mode: "recut",
    minGapDays: 14,
    how: "A new cut of the video with a new first line.",
    confidence: "common-practice",
    sources: [],
  },
  wechat_moments: {
    mode: "never",
    minGapDays: 30,
    how: "Your friends see everything; share once per campaign, and only again with real news.",
    confidence: "common-practice",
    sources: [],
  },
  producthunt: {
    mode: "never",
    minGapDays: 180,
    how: "Relaunch only for a major update, about 6 months after the last launch.",
    confidence: "sourced",
    sources: [
      "https://www.producthunt.com/launch/faqs",
      "https://www.producthunt.com/p/producthunt/how-often-should-you-launch-on-product-hunt",
    ],
  },
  youtube: {
    mode: "never",
    minGapDays: 30,
    how: "Don't re-upload. Cut a Short from the video instead.",
    confidence: "common-practice",
    sources: [],
  },
} as const satisfies { [id in PlatformId]: RepostStrategy };

export const REPOST_MODE_LABEL = {
  quote: "quote or rewrite",
  recut: "re-cut",
  never: "no reposts",
} as const satisfies { [mode in RepostMode]: string };
