import { countPostCharacters } from "@/lib/cc/count-post-characters";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { PostAsset } from "@/lib/cc/post-asset";

import { getPostingWindowCheck } from "./get-posting-window-check";
import { PLATFORM_PREFLIGHT } from "./platform-preflight";
import type { PreflightCheck } from "./preflight-check";

const HASHTAG_PATTERN = /(?<![\p{L}\p{N}_&])#[\p{L}_][\p{L}\p{N}_]*/gu;
const LINK_PATTERN =
  /https?:\/\/\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?![a-z0-9-])(?:\/\S*)?/i;
const VIDEO_PATTERN = /\.(?:mp4|mov|m4v|webm)$/i;
const IMAGE_PATTERN = /\.(?:png|jpe?g|gif|webp|heic)$/i;
const INSTAGRAM_HOOK_LENGTH = 125;
const LINKEDIN_FOLD_LENGTH = 210;

function getHashtagCheck(options: {
  platformId: PlatformId;
  copyText: string;
}): PreflightCheck {
  const rule = PLATFORM_PREFLIGHT[options.platformId].hashtags;
  const count = options.copyText.match(HASHTAG_PATTERN)?.length ?? 0;
  const label =
    rule.max === 0
      ? "No hashtags"
      : rule.min === 0
        ? `Hashtags ≤ ${rule.max}`
        : `Hashtags ${rule.min}–${rule.max}`;
  return {
    kind: "computed",
    id: "hashtags",
    label,
    passed: count >= rule.min && count <= rule.max,
    why: `${count} now. ${rule.why}`,
  };
}

function getMediaChecks(options: {
  platformId: PlatformId;
  assets: readonly PostAsset[];
}): PreflightCheck[] {
  const media = options.assets.filter(
    (asset) => VIDEO_PATTERN.test(asset.file) || IMAGE_PATTERN.test(asset.file)
  );
  const missingAlt = media.filter((asset) => asset.alt.trim() === "");
  const altCheck: PreflightCheck[] =
    media.length === 0
      ? []
      : [
          {
            kind: "computed",
            id: "alt",
            label: "Alt text on every image and video",
            passed: missingAlt.length === 0,
            why:
              missingAlt.length === 0
                ? "Screen reader users hear what the media shows."
                : `Missing on ${missingAlt.map((asset) => asset.file).join(", ")}.`,
          },
        ];
  const kind = PLATFORM_PREFLIGHT[options.platformId].media;
  switch (kind) {
    case "video": {
      const hasVideo = media.some((asset) => VIDEO_PATTERN.test(asset.file));
      return [
        {
          kind: "computed",
          id: "media",
          label: "Native video attached",
          passed: hasVideo,
          why: hasVideo
            ? "Uploaded video reaches more people than a link to one."
            : "Add the video file; uploaded video reaches more people than a link.",
        },
        ...altCheck,
      ];
    }
    case "image": {
      const hasImage = media.some((asset) => IMAGE_PATTERN.test(asset.file));
      return [
        {
          kind: "computed",
          id: "media",
          label: "Images attached",
          passed: hasImage,
          why: hasImage
            ? "The gallery or cover images are listed."
            : "Add the gallery or cover images.",
        },
        ...altCheck,
      ];
    }
    case "none":
      return altCheck;
    default: {
      const unhandled: never = kind;
      return unhandled;
    }
  }
}

function getPlatformChecks(options: {
  platformId: PlatformId;
  body: string;
  target: string;
  childBodies: readonly string[];
  sameDayTargets: readonly string[];
}): PreflightCheck[] {
  switch (options.platformId) {
    case "x": {
      const hasLink = LINK_PATTERN.test(options.body);
      const replyIndex = options.childBodies.findIndex((body) =>
        LINK_PATTERN.test(body)
      );
      return [
        {
          kind: "computed",
          id: "x-link",
          label: "Link in a reply, not the main post",
          passed: !hasLink,
          why: hasLink
            ? "X shows posts with links to fewer people. Consider the link in reply 1."
            : replyIndex === -1
              ? "No link in the main post."
              : `The link is in reply ${replyIndex + 1}.`,
        },
      ];
    }
    case "instagram": {
      const firstLine =
        options.body.split("\n").find((line) => line.trim() !== "") ?? "";
      const firstLineLength = countPostCharacters({
        text: firstLine,
        platformId: "instagram",
      });
      const hasLinkInBio = /link in (?:my )?bio/i.test(options.body);
      return [
        {
          kind: "computed",
          id: "instagram-hook",
          label: `Hook in the first ${INSTAGRAM_HOOK_LENGTH} characters`,
          passed:
            firstLineLength > 0 && firstLineLength <= INSTAGRAM_HOOK_LENGTH,
          why: `First line is ${firstLineLength}; Instagram cuts the caption at about ${INSTAGRAM_HOOK_LENGTH} before “more”.`,
        },
        {
          kind: "computed",
          id: "instagram-bio",
          label: "Says “link in bio”",
          passed: hasLinkInBio,
          why: "Links in captions are not clickable on Instagram.",
        },
      ];
    }
    case "reddit": {
      const hasTarget = options.target.trim() !== "";
      return [
        {
          kind: "computed",
          id: "reddit-target",
          label: "Subreddit set",
          passed: hasTarget,
          why: hasTarget
            ? `Posting to ${options.target.trim()}.`
            : "Set the subreddit so Open compose goes to its submit page.",
        },
        {
          kind: "computed",
          id: "reddit-one-per-day",
          label: "One subreddit per day",
          passed: options.sameDayTargets.length === 0,
          why:
            options.sameDayTargets.length === 0
              ? "No other Reddit post on the same day."
              : `Same day as ${options.sameDayTargets.join(", ")}. Reddit flags cross-posting as spam.`,
        },
      ];
    }
    case "producthunt": {
      const hasComment = options.childBodies.some((body) => body.trim() !== "");
      return [
        {
          kind: "computed",
          id: "ph-maker-comment",
          label: "Maker comment written",
          passed: hasComment,
          why: hasComment
            ? "Ready to post as soon as the launch is live."
            : "Write the maker comment before launch.",
        },
      ];
    }
    case "linkedin": {
      const opening = options.body.slice(0, LINKEDIN_FOLD_LENGTH);
      const hasOpeningBreak = opening.includes("\n");
      return [
        {
          kind: "computed",
          id: "linkedin-hook",
          label: `The point lands before “see more” (about ${LINKEDIN_FOLD_LENGTH} characters)`,
          passed:
            options.body.length <= LINKEDIN_FOLD_LENGTH || hasOpeningBreak,
          why: "LinkedIn folds a post after about 2 to 3 lines; open with one short line.",
        },
      ];
    }
    case "threads": {
      const hasTarget = options.target.trim() !== "";
      return [
        {
          kind: "computed",
          id: "threads-target",
          label: "Topic or community chosen",
          passed: hasTarget,
          why: hasTarget
            ? `Posting to ${options.target.trim()}.`
            : "Pick one topic or community on Threads and note it here, so Insights can compare them.",
        },
      ];
    }
    case "tiktok":
    case "xiaohongshu":
    case "wechat_channels":
    case "wechat_moments":
    case "youtube":
    case "bluesky":
      return [];
    default: {
      const unhandled: never = options.platformId;
      return unhandled;
    }
  }
}

function getLengthChecks(options: {
  platformId: PlatformId;
  title: string;
  copyText: string;
}): PreflightCheck[] {
  const platform = PLATFORMS[options.platformId];
  const bodyLimit: number | undefined = platform.bodyLimit;
  const titleLimit: number | undefined = platform.titleLimit;
  const titleCount = countPostCharacters({
    text: options.title,
    platformId: options.platformId,
  });
  const bodyCount = countPostCharacters({
    text: options.copyText,
    platformId: options.platformId,
  });
  const titleChecks: PreflightCheck[] =
    titleLimit === undefined
      ? []
      : [
          {
            kind: "computed",
            id: "title-length",
            label: `Title ≤ ${titleLimit}`,
            passed: titleCount > 0 && titleCount <= titleLimit,
            why:
              titleCount === 0
                ? "Add a title."
                : `${titleCount} / ${titleLimit}.`,
          },
        ];
  const bodyChecks: PreflightCheck[] =
    bodyLimit === undefined
      ? []
      : [
          {
            kind: "computed",
            id: "body-length",
            label: `Text ≤ ${bodyLimit.toLocaleString("en-US")}`,
            passed: bodyCount <= bodyLimit,
            why: `${bodyCount.toLocaleString("en-US")} / ${bodyLimit.toLocaleString("en-US")} as ${platform.label} counts it.`,
          },
        ];
  return [...titleChecks, ...bodyChecks];
}

/** Return the pre-flight rows for a draft: checks computed from its fields, then the platform's manual reminders. */
export function getPreflightChecks(options: {
  platformId: PlatformId;
  title: string;
  body: string;
  copyText: string;
  target: string;
  assets: readonly PostAsset[];
  scheduledAt: string | null;
  childBodies: readonly string[];
  sameDayTargets: readonly string[];
  now: Date;
}) {
  return [
    ...getLengthChecks(options),
    getHashtagCheck({
      platformId: options.platformId,
      copyText: options.copyText,
    }),
    ...getMediaChecks({
      platformId: options.platformId,
      assets: options.assets,
    }),
    ...getPlatformChecks(options),
    getPostingWindowCheck({
      platformId: options.platformId,
      scheduledAt: options.scheduledAt,
      now: options.now,
    }),
    ...PLATFORM_PREFLIGHT[options.platformId].manualChecks.map(
      (check): PreflightCheck => ({ kind: "manual", ...check })
    ),
  ];
}
