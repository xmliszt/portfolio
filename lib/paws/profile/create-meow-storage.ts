import "server-only";

import type { MeowStorage } from "./meow-pipeline-types";
import type { PawsServiceClient } from "./paws-service-client";

const BUCKET = "paws-meows";

/** Return uploads to and public URLs from the public `paws-meows` storage bucket. */
export function createMeowStorage(client: PawsServiceClient): MeowStorage {
  return {
    upload: async (upload) => {
      const { error } = await client.storage
        .from(BUCKET)
        .upload(upload.path, upload.bytes, { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
      if (error) throw error;
    },
    getPublicUrl: (path) => client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  };
}
