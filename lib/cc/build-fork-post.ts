import type { PostRow } from "./data/cc-rows";
import type { PlatformId } from "./platforms";

type ForkFields = Pick<
  PostRow,
  | "campaign_id"
  | "project"
  | "platform"
  | "kind"
  | "parent_post_id"
  | "target"
  | "title"
  | "body"
  | "hashtags"
  | "link"
  | "assets"
  | "wave"
>;

type ForkPost =
  | { kind: "insert"; fields: ForkFields }
  | { kind: "replace"; repostId: string; fields: ForkFields }
  | { kind: "error"; message: string; openPostId: string | undefined };

/** Return how to fork `source` onto `platformId`: insert a repost of `source` when it is posted on the same platform and has no `existingRepost`, replace a skipped `existingRepost`, insert a new post on another platform or from an unposted post, or refuse with the post to open instead. */
export function buildForkPost(options: {
  source: PostRow;
  platformId: PlatformId;
  existingRepost: { id: string; status: string } | undefined;
}): ForkPost {
  const source = options.source;
  const isSamePlatform = source.platform === options.platformId;
  if (
    isSamePlatform &&
    source.kind === "repost" &&
    source.status !== "posted"
  ) {
    return source.status === "skipped"
      ? {
          kind: "error",
          message: "This repost was skipped. Fork the original to reuse it.",
          openPostId: source.parent_post_id ?? undefined,
        }
      : {
          kind: "error",
          message:
            "This repost is not posted yet. Edit it here instead of forking it.",
          openPostId: undefined,
        };
  }
  const isRepost = isSamePlatform && source.status === "posted";
  const fields: ForkFields = {
    campaign_id: source.campaign_id,
    project: source.project,
    platform: options.platformId,
    kind: isRepost ? "repost" : "post",
    parent_post_id: isRepost ? source.id : null,
    target: isSamePlatform ? source.target : null,
    title: source.title,
    body: source.body,
    hashtags: source.hashtags,
    link: source.link,
    assets: source.assets,
    wave: source.wave,
  };
  const existing = options.existingRepost;
  if (!isRepost || existing === undefined) return { kind: "insert", fields };
  switch (existing.status) {
    case "skipped":
      return { kind: "replace", repostId: existing.id, fields };
    case "posted":
      return {
        kind: "error",
        message:
          "This post already has a posted repost. Fork that repost instead.",
        openPostId: existing.id,
      };
    default:
      return {
        kind: "error",
        message:
          "This post already has a repost waiting. Edit that one instead.",
        openPostId: existing.id,
      };
  }
}
