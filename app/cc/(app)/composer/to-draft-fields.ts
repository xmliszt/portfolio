import type { PostRow } from "@/lib/cc/data/cc-rows";

import type { DraftFields } from "./draft-fields";
import { parsePostAssets } from "./parse-post-assets";

/** Return the editable fields of `post`, with unset text fields as empty strings. */
export function toDraftFields(post: PostRow): DraftFields {
  return {
    title: post.title ?? "",
    body: post.body,
    hashtagsText: post.hashtags.join(" "),
    target: post.target ?? "",
    link: post.link ?? "",
    assets: parsePostAssets(post.assets),
  };
}
