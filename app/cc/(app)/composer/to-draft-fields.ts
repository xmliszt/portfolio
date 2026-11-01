import type { PostRow } from "@/lib/cc/data/cc-rows";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";

import type { DraftFields } from "./draft-fields";

/** Return the editable fields of `post`, with unset text fields as empty strings. */
export function toDraftFields(post: PostRow): DraftFields {
  return {
    title: post.title ?? "",
    body: post.body,
    hashtagsText: post.hashtags.join(" "),
    target: post.target ?? "",
    link: post.link ?? "",
    assets: parsePostAssets(post.assets),
    wave: post.wave === null ? "" : String(post.wave),
  };
}
