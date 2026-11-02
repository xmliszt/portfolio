import type { PostRow } from "./data/cc-rows";
import type { PlatformId } from "./platforms";

type ForkPost =
  | {
      kind: "ok";
      fields: Pick<
        PostRow,
        | "campaign_id"
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
    }
  | { kind: "error"; message: string };

/** Return the fields of a new draft copied from `source` for `platformId`: a repost of `source` when it is posted on the same platform, else a new post; refuse a repost when `source` already has one (`hasRepost`). */
export function buildForkPost(options: {
  source: PostRow;
  platformId: PlatformId;
  hasRepost: boolean;
}): ForkPost {
  const source = options.source;
  const isSamePlatform = source.platform === options.platformId;
  const isRepost = isSamePlatform && source.status === "posted";
  if (isRepost && options.hasRepost) {
    return {
      kind: "error",
      message:
        "This post already has a repost. Open that repost and fork it instead.",
    };
  }
  return {
    kind: "ok",
    fields: {
      campaign_id: source.campaign_id,
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
    },
  };
}
