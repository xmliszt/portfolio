import type { Json } from "./supabase/__generated__/types";
import type { PostAsset } from "./post-asset";

/** Return the `{ file, alt, path }` entries of a post's `assets` JSON, skipping entries without a `file` string. */
export function parsePostAssets(assets: Json): PostAsset[] {
  if (!Array.isArray(assets)) return [];
  return assets.flatMap((asset): PostAsset[] => {
    if (typeof asset !== "object" || asset === null || Array.isArray(asset)) {
      return [];
    }
    const file = asset.file;
    const alt = asset.alt;
    const path = asset.path;
    return typeof file === "string"
      ? [
          {
            file,
            alt: typeof alt === "string" ? alt : "",
            ...(typeof path === "string" ? { path } : {}),
          },
        ]
      : [];
  });
}
