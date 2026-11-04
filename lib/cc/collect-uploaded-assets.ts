import uniqBy from "lodash/uniqBy.js";

import type { Json } from "./supabase/__generated__/types";
import { parsePostAssets } from "./parse-post-assets";

/** Return each uploaded file in the given `assets` columns once, keyed by `path`, keeping the first `file` name seen for it. */
export function collectUploadedAssets(assetsColumns: readonly Json[]) {
  return uniqBy(
    assetsColumns
      .flatMap(parsePostAssets)
      .flatMap((asset) =>
        asset.path === undefined ? [] : [{ file: asset.file, path: asset.path }]
      ),
    "path"
  );
}
