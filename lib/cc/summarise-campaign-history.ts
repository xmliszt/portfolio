import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";

import { formatMetricNumber } from "./format-metric-number";
import { formatSgt } from "./format-sgt";
import { type PlatformId, PLATFORMS } from "./platforms";

/** One of the owner's earlier top-level posts for a product, as the smart campaign reads it. */
export type CampaignHistoryPost = {
  host: string;
  platformId: PlatformId;
  /** When it went out, or when it is scheduled to when `isPosted` is `false`. */
  at: Date;
  isPosted: boolean;
  firstLine: string;
  views24h: number | undefined;
  /** Median 24 h views of every post on this platform, or `undefined` when none has them. */
  medianViews24h: number | undefined;
  assetFiles: readonly string[];
  target: string | undefined;
};

const MAX_LINES_PER_PLATFORM = 5;
const MAX_FIRST_LINE = 80;
const VIDEO_FILE = /\.(mp4|mov|m4v|webm)$/i;
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|heic)$/i;

function describeMedia(files: readonly string[]) {
  const video = files.find((file) => VIDEO_FILE.test(file));
  if (video !== undefined) {
    return /promo/i.test(video)
      ? "promo video"
      : /features/i.test(video)
        ? "features video"
        : "video";
  }
  const imageCount = files.filter((file) => IMAGE_FILE.test(file)).length;
  if (imageCount > 0)
    return imageCount === 1 ? "1 image" : `${imageCount} images`;
  return "no media";
}

function getRatio(post: CampaignHistoryPost) {
  return post.views24h === undefined ||
    post.medianViews24h === undefined ||
    post.medianViews24h === 0
    ? undefined
    : post.views24h / post.medianViews24h;
}

function describeNumbers(post: CampaignHistoryPost) {
  if (post.views24h === undefined) return "no numbers";
  const ratio = getRatio(post);
  return `${formatMetricNumber(post.views24h)} views at 24 h${ratio === undefined ? "" : `, ${ratio.toFixed(1)}× median`}`;
}

function shorten(text: string) {
  const line = text.trim();
  return line.length <= MAX_FIRST_LINE
    ? line
    : `${line.slice(0, MAX_FIRST_LINE - 1).trimEnd()}…`;
}

/** Return the posted entries of `posts` on `platformIds` as one block per platform, best 24 h views against the platform median first, then those without numbers newest first, at most 5 lines each, with the SGT date, the first line cut to 80 characters, the numbers, the media and the target; "" when none was posted. */
export function summariseCampaignHistory(options: {
  posts: readonly CampaignHistoryPost[];
  platformIds: readonly PlatformId[];
}) {
  const byPlatform = groupBy(
    options.posts.filter((post) => post.isPosted),
    (post) => post.platformId
  );
  return options.platformIds
    .flatMap((platformId) => {
      const posts = byPlatform[platformId] ?? [];
      if (posts.length === 0) return [];
      const lines = sortBy(
        posts,
        (post) => -(getRatio(post) ?? Number.NEGATIVE_INFINITY),
        (post) => -post.at.getTime()
      )
        .slice(0, MAX_LINES_PER_PLATFORM)
        .map((post) =>
          [
            formatSgt({ date: post.at, pattern: "yyyy-MM-dd" }),
            `"${shorten(post.firstLine)}"`,
            describeNumbers(post),
            describeMedia(post.assetFiles),
            ...(post.target === undefined ? [] : [post.target]),
          ].join(" · ")
        );
      return [
        `${PLATFORMS[platformId].label}\n${lines.map((line) => `- ${line}`).join("\n")}`,
      ];
    })
    .join("\n\n");
}
