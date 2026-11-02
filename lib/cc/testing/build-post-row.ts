import type { PostRow } from "@/lib/cc/data/cc-rows";

/** Return a scheduled X post row with the given fields overriding the defaults. */
export function buildPostRow(options: Partial<PostRow>): PostRow {
  return {
    id: "post-1",
    campaign_id: "campaign-1",
    platform: "x",
    kind: "post",
    parent_post_id: null,
    target: null,
    scheduled_at: "2026-11-02T13:00:00.000Z",
    scheduled_by: "user",
    posted_at: null,
    status: "scheduled",
    title: "Paws launch",
    body: "Hello",
    hashtags: ["digitalart"],
    link: null,
    assets: [{ file: "film.mp4", alt: "", path: "c/uploads/1/film.mp4" }],
    url: null,
    variant: "mine",
    variant_group: null,
    wave: 1,
    auto_publish: false,
    publish_claimed_at: null,
    publish_error: null,
    repost_as: "post",
    platform_post_id: null,
    created_at: "2026-11-01T00:00:00.000Z",
    updated_at: "2026-11-01T00:00:00.000Z",
    ...options,
  };
}
