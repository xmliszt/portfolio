import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getOriginalUrl } from "@/lib/cc/get-original-url";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { getPostName } from "@/lib/cc/get-post-name";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { PLATFORMS } from "@/lib/cc/platforms";

import type { RunSheetItem } from "./run-sheet-row";

function getDay(iso: string) {
  return formatSgt({ date: new Date(iso), pattern: "yyyy-MM-dd" });
}

function getOpen(options: {
  post: PostRow & { platform: RunSheetItem["platformId"] };
  parent: PostRow | undefined;
  copyText: string;
}): RunSheetItem["open"] {
  const originalUrl = getOriginalUrl(options.post);
  if (originalUrl !== undefined) {
    return { kind: "copy-then-open", url: originalUrl };
  }
  if (
    (options.post.kind === "reply" || options.post.kind === "comment") &&
    options.post.parent_post_id !== null
  ) {
    return options.parent?.url
      ? { kind: "copy-then-open", url: options.parent.url }
      : { kind: "after-parent" };
  }
  if (PLATFORMS[options.post.platform].postsFromPhone) {
    return { kind: "phone" };
  }
  return buildComposeUrl({
    platformId: options.post.platform,
    body: options.copyText,
    title: options.post.title ?? undefined,
    link: options.post.link ?? undefined,
    target: options.post.target ?? undefined,
  });
}

/** Return the run sheet for the next Singapore day, from today on, that still has a scheduled post, or for today when none is left. */
export function buildRunSheet(options: { posts: PostRow[]; now: Date }) {
  const today = formatSgt({ date: options.now, pattern: "yyyy-MM-dd" });
  const scheduledAt = (post: PostRow) =>
    post.scheduled_at === null ? undefined : post.scheduled_at;
  const day =
    options.posts
      .filter((post) => post.status === "scheduled")
      .flatMap((post) => {
        const at = scheduledAt(post);
        return at === undefined || getDay(at) < today ? [] : [getDay(at)];
      })
      .toSorted()
      .at(0) ?? today;
  const nextTime = options.posts
    .filter(
      (post) =>
        post.status === "scheduled" &&
        post.scheduled_at !== null &&
        new Date(post.scheduled_at) > options.now
    )
    .map((post) => post.scheduled_at)
    .toSorted()
    .at(0);
  const postsById = Object.fromEntries(
    options.posts.map((post) => [post.id, post])
  );

  const items = options.posts.flatMap((post): RunSheetItem[] => {
    const at = scheduledAt(post);
    if (at === undefined || getDay(at) !== day) return [];
    const platform = post.platform;
    if (!isPlatformId(platform)) return [];
    const copyText = getPostCopyText({
      body: post.body,
      hashtags: post.hashtags,
    });
    const status = ((): RunSheetItem["status"] => {
      if (post.status === "posted" || post.status === "skipped") {
        return post.status;
      }
      if (post.status !== "scheduled") return "draft";
      if (at === nextTime) return "next";
      return new Date(at) <= options.now ? "due" : "queued";
    })();
    return [
      {
        id: post.id,
        timeLabel: formatSgt({ date: new Date(at), pattern: "HH:mm" }),
        platformId: platform,
        kind: post.kind,
        label:
          getPostName(post) ||
          (post.target === null ? PLATFORMS[platform].label : post.target),
        status,
        copyText,
        open: getOpen({
          post: { ...post, platform },
          parent:
            post.parent_post_id === null
              ? undefined
              : postsById[post.parent_post_id],
          copyText,
        }),
      },
    ];
  });

  return {
    dayLabel: formatSgt({
      date: new Date(`${day}T12:00:00+08:00`),
      pattern: "EEE dd MMM",
    }),
    items,
  };
}
