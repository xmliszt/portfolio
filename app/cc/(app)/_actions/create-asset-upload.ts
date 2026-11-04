"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { buildMediaPath } from "@/lib/cc/build-media-path";
import { CC_ASSETS_BUCKET } from "@/lib/cc/post-asset";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type AssetUploadTarget =
  | { kind: "existing"; path: string }
  | {
      kind: "upload";
      path: string;
      token: string;
      supabaseUrl: string;
      anonKey: string;
    };

/** Return the path of the stored file whose content hash is `sha256` when one exists; otherwise reserve `media/<sha256>/<fileName>` and return it with a one-time token the browser uploads the file with. */
export async function createAssetUpload(options: {
  fileName: string;
  sha256: string;
}): Promise<AssetUploadTarget> {
  await requireCcOwner();
  const { folder, path } = buildMediaPath(options);
  const storage = createCcServiceClient().storage.from(CC_ASSETS_BUCKET);
  const { data: existing, error: listError } = await storage.list(folder, {
    limit: 1,
  });
  if (listError) throw listError;
  const existingName = existing.at(0)?.name;
  if (existingName !== undefined) {
    return { kind: "existing", path: `${folder}/${existingName}` };
  }
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error) throw error;
  return {
    kind: "upload",
    path: data.path,
    token: data.token,
    supabaseUrl: process.env.SUPABASE_DB_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
