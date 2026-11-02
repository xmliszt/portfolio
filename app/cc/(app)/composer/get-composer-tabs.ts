import type { PostStatusTone } from "@/app/cc/_ui/status-dot";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostName } from "@/lib/cc/get-post-name";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { PLATFORMS } from "@/lib/cc/platforms";

import type { ComposerTab } from "./composer-tab";
import { isComposerTopLevel } from "./is-composer-top-level";

function getTone(post: PostRow): { tone: PostStatusTone; label: string } {
  if (post.status === "posted") return { tone: "posted", label: "posted" };
  if (post.status === "skipped") return { tone: "skipped", label: "skipped" };
  if (post.publish_error !== null) return { tone: "failed", label: "failed" };
  if (post.auto_publish) return { tone: "next", label: "auto" };
  if (post.status === "draft") return { tone: "draft", label: "draft" };
  return { tone: "scheduled", label: "manual" };
}

/** Return one list row per post `isComposerTopLevel` accepts, in time order (unscheduled last), with its SGT day and time, name, and a status tone and word. */
export function getComposerTabs(posts: readonly PostRow[]) {
  return posts
    .filter(isComposerTopLevel)
    .toSorted((a, b) =>
      (a.scheduled_at ?? "~").localeCompare(b.scheduled_at ?? "~")
    )
    .flatMap((post): ComposerTab[] => {
      if (!isPlatformId(post.platform)) return [];
      const at =
        post.scheduled_at === null ? undefined : new Date(post.scheduled_at);
      const status = getTone(post);
      return [
        {
          postId: post.id,
          platformId: post.platform,
          name:
            getPostName(post) || post.target || PLATFORMS[post.platform].label,
          dayLabel:
            at === undefined
              ? "UNSCHEDULED"
              : formatSgt({ date: at, pattern: "EEE dd MMM" }).toUpperCase(),
          timeLabel:
            at === undefined
              ? "--:--"
              : formatSgt({ date: at, pattern: "HH:mm" }),
          tone: status.tone,
          statusLabel: status.label,
        },
      ];
    });
}
