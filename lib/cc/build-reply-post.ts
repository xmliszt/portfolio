import max from "lodash/max.js";

import type { PostRow } from "./data/cc-rows";
import { canTakeReplies } from "./can-take-replies";

const REPLY_GAP_MS = 60_000;

type ReplyFields = Pick<
  PostRow,
  | "campaign_id"
  | "project"
  | "platform"
  | "kind"
  | "parent_post_id"
  | "status"
  | "scheduled_at"
  | "scheduled_by"
  | "wave"
>;

/** Return the fields of a new empty reply under `parent`, scheduled a minute after the parent or its latest unskipped reply in `replies` (and after `now` once the parent is posted), or why `parent` cannot take one. */
export function buildReplyPost(options: {
  parent: PostRow;
  replies: readonly Pick<PostRow, "status" | "scheduled_at">[];
  now: Date;
}): { kind: "ok"; fields: ReplyFields } | { kind: "error"; message: string } {
  const parent = options.parent;
  if (!canTakeReplies(parent)) {
    return {
      kind: "error",
      message:
        "Only an X, Threads or Bluesky post or quote that is not skipped can take replies.",
    };
  }
  const latest = max(
    [
      parent.scheduled_at,
      ...options.replies
        .filter((reply) => reply.status !== "skipped")
        .map((reply) => reply.scheduled_at),
    ].flatMap((at) => (at === null ? [] : [new Date(at).getTime()]))
  );
  const base =
    latest === undefined || parent.status !== "posted"
      ? latest
      : Math.max(latest, options.now.getTime());
  return {
    kind: "ok",
    fields: {
      campaign_id: parent.campaign_id,
      project: parent.project,
      platform: parent.platform,
      kind: "reply",
      parent_post_id: parent.id,
      status: parent.status === "draft" ? "draft" : "scheduled",
      scheduled_at:
        parent.scheduled_at === null || base === undefined
          ? null
          : new Date(base + REPLY_GAP_MS).toISOString(),
      scheduled_by: "user",
      wave: parent.wave,
    },
  };
}
