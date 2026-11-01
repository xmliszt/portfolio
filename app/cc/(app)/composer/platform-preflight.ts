import type { PlatformId } from "@/lib/cc/platforms";

type ManualCheck = { id: string; label: string; why: string };

type PlatformPreflight = {
  /** Hashtag count range from research/platform-limits.md. */
  hashtags: { min: number; max: number; why: string };
  media: "video" | "image" | "none";
  audience: { en: string; zh: string };
  manualChecks: readonly ManualCheck[];
};

/** Pre-flight rules per platform from research/platform-limits.md: what the Composer checks from the post, and what the owner ticks by hand. */
export const PLATFORM_PREFLIGHT = {
  producthunt: {
    hashtags: { min: 0, max: 0, why: "Product Hunt has no hashtags." },
    media: "image",
    audience: {
      en: "makers and early adopters who try new things on launch day",
      zh: "在发布日尝鲜的独立开发者和早期用户",
    },
    manualChecks: [
      {
        id: "ph-why",
        label: "Tagline states the why",
        why: "Paws is art first: the intent comes before the features.",
      },
      {
        id: "ph-first-image",
        label: "First gallery image is the room shot",
        why: "The feed crops it to about 4:3.",
      },
      {
        id: "ph-maker-comment-now",
        label: "Maker comment posted right away",
        why: "Early comments keep the launch near the top.",
      },
    ],
  },
  x: {
    hashtags: { min: 0, max: 2, why: "Tags rarely help on X." },
    media: "video",
    audience: {
      en: "people who like slow, artful web things",
      zh: "喜欢慢一点、有艺术感的网页作品的人",
    },
    manualChecks: [
      {
        id: "x-first-line",
        label: "First line works alone",
        why: "It is all most people see before “Show more”.",
      },
    ],
  },
  threads: {
    hashtags: {
      min: 0,
      max: 1,
      why: "Threads allows one topic tag; stacks look automated.",
    },
    media: "video",
    audience: {
      en: "people who like gentle, artful posts and cats",
      zh: "喜欢温柔、有艺术感的内容和猫的人",
    },
    manualChecks: [
      {
        id: "threads-first-line",
        label: "First line works alone",
        why: "It is all most people see in the feed.",
      },
    ],
  },
  instagram: {
    hashtags: {
      min: 3,
      max: 8,
      why: "3–8 specific tags; Instagram allows 30 but more looks automated.",
    },
    media: "video",
    audience: {
      en: "people who follow digital art, risograph prints and cats",
      zh: "关注数字艺术、孔版印刷和猫的人",
    },
    manualChecks: [
      {
        id: "instagram-cover",
        label: "Cover set",
        why: "The cover is what the profile grid shows.",
      },
    ],
  },
  tiktok: {
    hashtags: { min: 3, max: 6, why: "3–6 tags help TikTok place the video." },
    media: "video",
    audience: {
      en: "people scrolling cat and art videos",
      zh: "刷猫咪和艺术视频的人",
    },
    manualChecks: [
      {
        id: "tiktok-hook",
        label: "Hook in the first line",
        why: "The caption is cut after one line.",
      },
      {
        id: "tiktok-cover",
        label: "Cover set",
        why: "The cover is what the profile grid shows.",
      },
    ],
  },
  reddit: {
    hashtags: { min: 0, max: 0, why: "Hashtags read as spam on Reddit." },
    media: "none",
    audience: {
      en: "subreddit readers who dislike self-promotion but like honest makers",
      zh: "不喜欢推销、但欣赏真诚创作者的 Reddit 读者",
    },
    manualChecks: [
      {
        id: "reddit-rules",
        label: "Subreddit rules read",
        why: "Each subreddit has its own rules on self-promotion and flair.",
      },
      {
        id: "reddit-post-type",
        label: "Link post or video post chosen",
        why: "Some subreddits allow only one of them.",
      },
    ],
  },
  xiaohongshu: {
    hashtags: { min: 3, max: 8, why: "3–8 个话题，太多像机器发的。" },
    media: "video",
    audience: {
      en: "young people on 小红书 who like cats, illustration and small websites",
      zh: "喜欢猫、插画和小众网站的年轻人",
    },
    manualChecks: [
      {
        id: "xhs-title-hook",
        label: "标题 carries the hook",
        why: "The feed shows the cover and the 标题 only.",
      },
      {
        id: "xhs-cover",
        label: "Cover is 3:4",
        why: "Other ratios get cropped in the feed.",
      },
      {
        id: "xhs-category-window",
        label: "Posting window fits the category",
        why: "小红书 peak hours differ by category.",
      },
    ],
  },
  wechat_channels: {
    hashtags: { min: 0, max: 3, why: "话题 ≤3." },
    media: "video",
    audience: {
      en: "friends and people who follow indie makers on WeChat",
      zh: "微信上的朋友和关注独立开发的人",
    },
    manualChecks: [
      {
        id: "channels-first-line",
        label: "Short why in the first line",
        why: "The description is cut after one line.",
      },
    ],
  },
  wechat_article: {
    hashtags: { min: 0, max: 0, why: "公众号 articles carry no hashtags." },
    media: "image",
    audience: {
      en: "friends who follow my 公众号",
      zh: "关注我公众号的朋友",
    },
    manualChecks: [
      {
        id: "article-covers",
        label: "首图 2.35:1 and 次条 1:1 covers",
        why: "Other ratios get cropped in the chat list.",
      },
      {
        id: "article-summary",
        label: "摘要 set (≤120)",
        why: "The 摘要 shows under the title when the article is shared.",
      },
    ],
  },
  youtube: {
    hashtags: {
      min: 0,
      max: 3,
      why: "YouTube shows up to 3 tags above the title.",
    },
    media: "video",
    audience: {
      en: "people who like cosy art and small web projects",
      zh: "喜欢温柔的艺术和小型网页作品的人",
    },
    manualChecks: [],
  },
} as const satisfies { [id in PlatformId]: PlatformPreflight };
