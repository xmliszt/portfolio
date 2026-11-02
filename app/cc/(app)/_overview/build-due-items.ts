import type { PostRow, ReminderRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostName } from "@/lib/cc/get-post-name";
import type { getRepostSuggestions } from "@/lib/cc/get-repost-suggestions";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { listMetricLabels } from "@/lib/cc/list-metric-labels";
import { PLATFORMS } from "@/lib/cc/platforms";

export type DueItem = {
  key: string;
  kindLabel: string;
  whenLabel: string;
  text: string;
  cta: { label: string; href: string; isExternal: boolean };
};

/** Return the "Due now" cards for due `reminders` and for `repostSuggestions` on `kind = 'post'` posts that have no repost yet, using `posts` to describe each one. */
export function buildDueItems(options: {
  reminders: ReminderRow[];
  posts: PostRow[];
  repostSuggestions: ReturnType<typeof getRepostSuggestions>;
}): DueItem[] {
  const postsById = Object.fromEntries(
    options.posts.map((post) => [post.id, post])
  );
  const repostedIds = new Set(
    options.posts.flatMap((post) =>
      post.kind === "repost" && post.parent_post_id !== null
        ? [post.parent_post_id]
        : []
    )
  );
  const composerHref = (postId: string) => `/composer?post=${postId}`;

  const reminderItems = options.reminders.flatMap((reminder): DueItem[] => {
    const post = postsById[reminder.post_id];
    if (post === undefined || !isPlatformId(post.platform)) return [];
    const platform = PLATFORMS[post.platform];
    const whenLabel = `${platform.shortLabel} · ${formatSgt({ date: new Date(reminder.fire_at), pattern: "EEE dd MMM HH:mm" }).toUpperCase()}`;
    const name = getPostName(post);
    switch (reminder.kind) {
      case "post":
        return [
          {
            key: `reminder-${reminder.id}`,
            kindLabel: "POST · −10 MIN",
            whenLabel,
            text: `Post on ${platform.label}: ${name}`,
            cta: {
              label: "Open in composer",
              href: composerHref(post.id),
              isExternal: false,
            },
          },
        ];
      case "reply":
        return [
          {
            key: `reminder-${reminder.id}`,
            kindLabel: "REPLY · +30 MIN",
            whenLabel,
            text: `Reply to comments on ${platform.label}: ${name}`,
            cta:
              post.url === null
                ? {
                    label: "Open in composer",
                    href: composerHref(post.id),
                    isExternal: false,
                  }
                : { label: "Open the post", href: post.url, isExternal: true },
          },
        ];
      case "log":
        return [
          {
            key: `reminder-${reminder.id}`,
            kindLabel: `LOG · +${(reminder.checkpoint ?? "").toUpperCase()}`,
            whenLabel,
            text: `Log ${listMetricLabels({ platformId: platform.id }).join(", ")} for ${name}`,
            cta: { label: "Log numbers", href: "/log", isExternal: false },
          },
        ];
      default:
        return [];
    }
  });

  const suggestionItems = options.repostSuggestions.flatMap(
    (suggestion): DueItem[] => {
      const post = postsById[suggestion.post.id];
      if (
        post === undefined ||
        post.kind !== "post" ||
        repostedIds.has(post.id)
      ) {
        return [];
      }
      const platform = PLATFORMS[suggestion.post.platform];
      return [
        {
          key: `repost-${post.id}`,
          kindLabel: "REPOST",
          whenLabel: platform.shortLabel,
          text: `${getPostName(post)} reached ${suggestion.ratio.toFixed(1)}× your ${platform.label} median at 24 h. Plan a repost or re-cut in the next window.`,
          cta: {
            label: "Plan in composer",
            href: composerHref(post.id),
            isExternal: false,
          },
        },
      ];
    }
  );

  return [...reminderItems, ...suggestionItems];
}
