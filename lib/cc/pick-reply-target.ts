type ReplyCandidate = {
  id: string;
  kind: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
};

function getOrderKey(post: ReplyCandidate) {
  return `${post.scheduled_at ?? ""}|${post.created_at}`;
}

/** Return the id of the post `reply` should answer: the latest posted sibling reply ordered before it, so replies read as a thread, else `parentId`. */
export function pickReplyTarget(options: {
  reply: ReplyCandidate;
  parentId: string;
  siblings: readonly ReplyCandidate[];
}) {
  const replyKey = getOrderKey(options.reply);
  const earlier = options.siblings
    .filter(
      (sibling) =>
        sibling.id !== options.reply.id &&
        sibling.kind === "reply" &&
        sibling.status === "posted" &&
        getOrderKey(sibling) < replyKey
    )
    .toSorted((a, b) => (getOrderKey(a) < getOrderKey(b) ? -1 : 1));
  return earlier.at(-1)?.id ?? options.parentId;
}
