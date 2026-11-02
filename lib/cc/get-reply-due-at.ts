type ScheduledPost = {
  scheduled_at: string | null;
  posted_at: string | null;
  status: string;
};

/** Return when a reply is due: its parent's `posted_at` plus the gap the plan set between the parent's and the reply's `scheduled_at` (never negative); `undefined` while the parent is not posted. */
export function getReplyDueAt(options: {
  reply: ScheduledPost;
  parent: ScheduledPost;
}) {
  if (options.parent.status !== "posted" || options.parent.posted_at === null) {
    return undefined;
  }
  const postedAtMs = new Date(options.parent.posted_at).getTime();
  const gapMs =
    options.reply.scheduled_at === null || options.parent.scheduled_at === null
      ? 0
      : new Date(options.reply.scheduled_at).getTime() -
        new Date(options.parent.scheduled_at).getTime();
  return new Date(postedAtMs + Math.max(0, gapMs));
}
