import { toOriginalPost } from "./to-original-post";

/** Return a link to the post in `original_ref`: the link itself, or one built from an X post id or a Bluesky `at://` URI; `undefined` when it is unset or holds an id with no public link. */
export function getOriginalUrl(post: {
  platform: string;
  original_ref: string | null;
}) {
  if (post.original_ref === null) return undefined;
  const original = toOriginalPost(post.original_ref);
  if (original.url !== null) return original.url;
  const id = original.platform_post_id;
  if (post.platform === "x" && /^\d{1,19}$/.test(id)) {
    return `https://x.com/i/web/status/${id}`;
  }
  const atUri = /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([^/]+)$/.exec(id);
  return post.platform === "bluesky" && atUri !== null
    ? `https://bsky.app/profile/${atUri[1]}/post/${atUri[2]}`
    : undefined;
}
