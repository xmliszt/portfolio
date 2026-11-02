import { MISSED_AFTER_MS } from "./get-auto-publish-state";
import { getReplyDueAt } from "./get-reply-due-at";

type ReplyPost = {
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
};

/** Return why auto-posting cannot be turned on for a reply under `parent`: the parent will not be posted by CC or by hand, or it is posted and the reply is over 30 minutes past its time; `undefined` when it can. */
export function getReplyAutoPublishError(options: {
  reply: ReplyPost;
  parent: (ReplyPost & { auto_publish: boolean }) | undefined;
  now: Date;
}) {
  const parent = options.parent;
  if (parent === undefined) return "This reply has no parent post.";
  if (parent.status === "skipped") return "Its parent post was skipped.";
  if (parent.status !== "posted") {
    return parent.auto_publish
      ? undefined
      : "Turn on auto-post for the parent post first, or mark it posted.";
  }
  const dueAt = getReplyDueAt({ reply: options.reply, parent });
  return dueAt !== undefined &&
    dueAt.getTime() > options.now.getTime() - MISSED_AFTER_MS
    ? undefined
    : "The parent is already live and this reply's time has passed. Use Post now.";
}
