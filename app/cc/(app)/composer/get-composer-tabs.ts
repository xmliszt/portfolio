import groupBy from "lodash/groupBy.js";

import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { PLATFORM_IDS, PLATFORMS } from "@/lib/cc/platforms";

import type { ComposerTab } from "./composer-tab";
import { isComposerTopLevel } from "./is-composer-top-level";

/** Return one tab per post `isComposerTopLevel` accepts, grouped in `PLATFORM_IDS` order, with a subreddit or time to tell apart posts on the same platform. */
export function getComposerTabs(posts: readonly PostRow[]) {
  const topLevel = posts.filter(isComposerTopLevel);
  const byPlatform = groupBy(topLevel, (post) => post.platform);
  return PLATFORM_IDS.flatMap((platformId) => {
    const group = byPlatform[platformId] ?? [];
    return group.map((post): ComposerTab => {
      const time =
        post.scheduled_at === null
          ? "unscheduled"
          : formatSgt({
              date: new Date(post.scheduled_at),
              pattern: "EEE dd MMM HH:mm",
            });
      return {
        postId: post.id,
        platformId,
        label: PLATFORMS[platformId].shortLabel,
        detail: group.length > 1 ? (post.target ?? time) : undefined,
        isPosted: post.status === "posted",
      };
    });
  });
}
