import "server-only";

import { CC_ASSETS_BUCKET } from "@/lib/cc/post-asset";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the bytes of the object at `path` in the assets bucket. */
export async function downloadAsset(options: { path: string }) {
  const { data, error } = await createCcServiceClient()
    .storage.from(CC_ASSETS_BUCKET)
    .download(options.path);
  if (error) throw error;
  return data;
}
