import type { PostRow } from "@/lib/cc/data/cc-rows";

/** Return the post's title, or its first non-empty body line, cut to 80 characters. */
export function getPostLabel(post: Pick<PostRow, "title" | "body">) {
  const label =
    post.title ??
    post.body.split("\n").find((line) => line.trim() !== "") ??
    "Untitled";
  return label.slice(0, 80);
}
