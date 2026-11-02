import { getReplyDueAt } from "./get-reply-due-at";

type StatePost = {
  kind: string;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
};

type AutoPublishState =
  | { kind: "due" }
  | { kind: "wait" }
  | { kind: "missed"; reason: string };

const MISSED_AFTER_MS = 30 * 60_000;

/** Return whether an auto-post `candidate` is due now, still waiting (before its time, or a reply whose `parent` is not posted yet), or missed (over 30 minutes late, or a reply whose parent was skipped or is gone). */
export function getAutoPublishState(options: {
  candidate: StatePost;
  parent: StatePost | undefined;
  now: Date;
}): AutoPublishState {
  const isReply =
    options.candidate.kind === "reply" || options.candidate.kind === "comment";
  const dueAt = (() => {
    if (!isReply) {
      return options.candidate.scheduled_at === null
        ? undefined
        : new Date(options.candidate.scheduled_at);
    }
    if (options.parent === undefined) return undefined;
    return getReplyDueAt({ reply: options.candidate, parent: options.parent });
  })();
  if (isReply && options.parent === undefined) {
    return { kind: "missed", reason: "Its parent post is gone." };
  }
  if (isReply && options.parent?.status === "skipped") {
    return { kind: "missed", reason: "Its parent post was skipped." };
  }
  if (dueAt === undefined || dueAt > options.now) return { kind: "wait" };
  return options.now.getTime() - dueAt.getTime() > MISSED_AFTER_MS
    ? {
        kind: "missed",
        reason:
          "CC missed this post's time by over 30 minutes, so it did not post it.",
      }
    : { kind: "due" };
}
