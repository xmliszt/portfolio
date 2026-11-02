/** How a `kind: "repost"` row goes out: as a new post with its own text, as a quote of the original, or as a plain repost of the original with no text. */
export const REPOST_PUBLISH_MODES = ["post", "quote", "repost"] as const;

export type RepostPublishMode = (typeof REPOST_PUBLISH_MODES)[number];
