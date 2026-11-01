export const PLATFORM_IDS = [
  "producthunt",
  "x",
  "threads",
  "instagram",
  "tiktok",
  "reddit",
  "xiaohongshu",
  "wechat_channels",
  "wechat_moments",
  "youtube",
  "linkedin",
] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

export const METRIC_FIELDS = [
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "clicks",
  "upvotes",
  "rank",
] as const;

export type MetricField = (typeof METRIC_FIELDS)[number];

export type Platform = {
  id: PlatformId;
  label: string;
  shortLabel: string;
  colorVar: string;
  /** Character limit on the main text, or `undefined` when the platform has none worth checking. */
  bodyLimit: number | undefined;
  /** Character limit on the title field, for platforms that have one. */
  titleLimit: number | undefined;
  maxHashtags: number;
  /** Metrics this platform shows, in the order the log form and Telegram print them. */
  metrics: readonly MetricField[];
  composeUrl: string;
  postsFromPhone: boolean;
};

export const PLATFORMS = {
  producthunt: {
    id: "producthunt",
    label: "Product Hunt",
    shortLabel: "PH",
    colorVar: "--cc-platform-producthunt",
    bodyLimit: 260,
    titleLimit: 60,
    maxHashtags: 0,
    metrics: ["upvotes", "comments", "rank", "clicks"],
    composeUrl: "https://www.producthunt.com/posts/new",
    postsFromPhone: false,
  },
  x: {
    id: "x",
    label: "X",
    shortLabel: "X",
    colorVar: "--cc-platform-x",
    bodyLimit: 280,
    titleLimit: undefined,
    maxHashtags: 2,
    metrics: ["views", "likes", "comments", "shares", "saves", "clicks"],
    composeUrl: "https://x.com/intent/post",
    postsFromPhone: false,
  },
  threads: {
    id: "threads",
    label: "Threads",
    shortLabel: "THREADS",
    colorVar: "--cc-platform-threads",
    bodyLimit: 500,
    titleLimit: undefined,
    maxHashtags: 1,
    metrics: ["views", "likes", "comments", "shares"],
    composeUrl: "https://www.threads.net/intent/post",
    postsFromPhone: false,
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    shortLabel: "IG",
    colorVar: "--cc-platform-instagram",
    bodyLimit: 2200,
    titleLimit: undefined,
    maxHashtags: 8,
    metrics: ["views", "likes", "comments", "shares", "saves"],
    composeUrl: "https://www.instagram.com/",
    postsFromPhone: true,
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok",
    shortLabel: "TIKTOK",
    colorVar: "--cc-platform-tiktok",
    bodyLimit: 2200,
    titleLimit: undefined,
    maxHashtags: 6,
    metrics: ["views", "likes", "comments", "shares", "saves"],
    composeUrl: "https://www.tiktok.com/upload",
    postsFromPhone: true,
  },
  reddit: {
    id: "reddit",
    label: "Reddit",
    shortLabel: "REDDIT",
    colorVar: "--cc-platform-reddit",
    bodyLimit: undefined,
    titleLimit: 300,
    maxHashtags: 0,
    metrics: ["views", "upvotes", "comments", "shares"],
    composeUrl: "https://www.reddit.com/submit",
    postsFromPhone: false,
  },
  xiaohongshu: {
    id: "xiaohongshu",
    label: "小红书",
    shortLabel: "小红书",
    colorVar: "--cc-platform-xiaohongshu",
    bodyLimit: 1000,
    titleLimit: 20,
    maxHashtags: 8,
    metrics: ["views", "likes", "saves", "comments", "shares"],
    composeUrl: "https://creator.xiaohongshu.com/publish/publish",
    postsFromPhone: true,
  },
  wechat_channels: {
    id: "wechat_channels",
    label: "视频号",
    shortLabel: "视频号",
    colorVar: "--cc-platform-wechat",
    bodyLimit: 1000,
    titleLimit: undefined,
    maxHashtags: 3,
    metrics: ["views", "likes", "comments", "shares"],
    composeUrl: "https://channels.weixin.qq.com/platform/post/create",
    postsFromPhone: true,
  },
  wechat_moments: {
    id: "wechat_moments",
    label: "朋友圈",
    shortLabel: "朋友圈",
    colorVar: "--cc-platform-wechat",
    bodyLimit: undefined,
    titleLimit: undefined,
    maxHashtags: 0,
    metrics: ["likes", "comments"],
    composeUrl: "https://weixin.qq.com/",
    postsFromPhone: true,
  },
  youtube: {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YT",
    colorVar: "--cc-platform-youtube",
    bodyLimit: 5000,
    titleLimit: 100,
    maxHashtags: 3,
    metrics: ["views", "likes", "comments"],
    composeUrl: "https://studio.youtube.com/",
    postsFromPhone: false,
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "IN",
    colorVar: "--cc-platform-linkedin",
    bodyLimit: 3000,
    titleLimit: undefined,
    maxHashtags: 5,
    metrics: ["views", "likes", "comments", "shares", "clicks"],
    composeUrl: "https://www.linkedin.com/feed/?shareActive=true",
    postsFromPhone: false,
  },
} as const satisfies { [id in PlatformId]: Platform };
