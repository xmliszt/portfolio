import { parseXStatusId } from "./parse-x-status-id";

/** Return the X post id of a CC post from its `platform_post_id`, else from the status id in its `url`, or why neither holds one. */
export function resolveXPostId(post: {
  platform_post_id: string | null;
  url: string | null;
}): { kind: "ok"; value: string } | { kind: "error"; message: string } {
  const id =
    post.platform_post_id ??
    (post.url === null ? undefined : parseXStatusId(post.url));
  return id === undefined
    ? {
        kind: "error",
        message: "CC could not find that X post. Paste its live link.",
      }
    : { kind: "ok", value: id };
}
