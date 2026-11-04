/** What a custom post on an auto-post platform does: a new post, or a reply to, quote of or plain repost of the post in its `original_ref`. */
export const POST_TYPES = ["post", "reply", "quote", "repost"] as const;

export type PostType = (typeof POST_TYPES)[number];
