import type { DraftFields } from "./draft-fields";
import { parseHashtags } from "./parse-hashtags";

function toNullable(text: string) {
  const trimmed = text.trim();
  return trimmed === "" ? null : trimmed;
}

/** Return `draft` as `posts` column values, with empty text fields and an automatic `wave` as `null` and asset rows without a file dropped. */
export function toPostFields(draft: DraftFields) {
  return {
    title: toNullable(draft.title),
    body: draft.body,
    hashtags: parseHashtags(draft.hashtagsText),
    target: toNullable(draft.target),
    link: toNullable(draft.link),
    assets: draft.assets
      .filter((asset) => asset.file.trim() !== "")
      .map((asset) => ({
        file: asset.file.trim(),
        alt: asset.alt.trim(),
        ...(asset.path === undefined ? {} : { path: asset.path }),
      })),
    wave: draft.wave === "" ? null : Number(draft.wave),
  };
}
