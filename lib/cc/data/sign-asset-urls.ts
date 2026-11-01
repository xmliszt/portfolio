import "server-only";

import { CC_ASSETS_BUCKET } from "@/lib/cc/post-asset";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return a signed URL for each object path that exists in the assets bucket, valid for `expiresInS` seconds; with `isDownload` the URL makes the browser save the file. */
export async function signAssetUrls(options: {
  paths: readonly string[];
  expiresInS: number;
  isDownload: boolean;
}) {
  if (options.paths.length === 0) return {};
  const { data, error } = await createCcServiceClient()
    .storage.from(CC_ASSETS_BUCKET)
    .createSignedUrls([...options.paths], options.expiresInS, {
      download: options.isDownload,
    });
  if (error) throw error;
  return Object.fromEntries(
    data.flatMap((entry): [string, string][] =>
      entry.path === null || entry.error !== null || !entry.signedUrl
        ? []
        : [[entry.path, entry.signedUrl]]
    )
  );
}
