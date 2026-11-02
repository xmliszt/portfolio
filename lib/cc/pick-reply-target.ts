import maxBy from "lodash/maxBy.js";

type ReplyCandidate = {
  id: string;
  kind: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  platform_post_id: string | null;
  url: string | null;
};

/** Return the key replies are ordered by: `scheduled_at`, then `created_at`, then `id`. */
export function getReplyOrderKey(post: {
  id: string;
  scheduled_at: string | null;
  created_at: string;
}) {
  return `${post.scheduled_at ?? ""}|${post.created_at}|${post.id}`;
}

/** Return the id of the post `reply` should answer: the latest sibling reply ordered before it that the platform has (`status` "posted" or a `platform_post_id`) and that CC can find (a `platform_post_id` or `url`), so replies read as a thread; else `parentId`. */
export function pickReplyTarget(options: {
  reply: ReplyCandidate;
  parentId: string;
  siblings: readonly ReplyCandidate[];
}) {
  const replyKey = getReplyOrderKey(options.reply);
  const earlier = options.siblings.filter(
    (sibling) =>
      sibling.id !== options.reply.id &&
      sibling.kind === "reply" &&
      (sibling.status === "posted" || sibling.platform_post_id !== null) &&
      (sibling.platform_post_id !== null || sibling.url !== null) &&
      getReplyOrderKey(sibling) < replyKey
  );
  return maxBy(earlier, getReplyOrderKey)?.id ?? options.parentId;
}
