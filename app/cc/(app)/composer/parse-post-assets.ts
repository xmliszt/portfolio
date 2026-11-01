import type { Json } from "@/lib/cc/supabase/__generated__/types";

import type { PostAsset } from "./draft-fields";

/** Return the `{ file, alt }` entries of a post's `assets` JSON, skipping entries without a `file` string. */
export function parsePostAssets(assets: Json): PostAsset[] {
  if (!Array.isArray(assets)) return [];
  return assets.flatMap((asset) => {
    if (typeof asset !== "object" || asset === null || Array.isArray(asset)) {
      return [];
    }
    const file = asset.file;
    const alt = asset.alt;
    return typeof file === "string"
      ? [{ file, alt: typeof alt === "string" ? alt : "" }]
      : [];
  });
}
