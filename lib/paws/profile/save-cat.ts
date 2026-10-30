import "server-only";

import type { PutCatRequest, SavedCat } from "@/lib/paws/cat-api-types";

import { createMeowStorage } from "./create-meow-storage";
import type { PawsServiceClient } from "./paws-service-client";
import { toSavedCat } from "./to-saved-cat";

/** Create or update `userId`'s cat look and voice, keeping its own meow, and return the saved cat. */
export async function saveCat(options: {
  client: PawsServiceClient;
  userId: string;
  cat: PutCatRequest;
}): Promise<SavedCat> {
  const { data, error } = await options.client
    .from("cats")
    .upsert(
      {
        user_id: options.userId,
        look: options.cat.look,
        voice: options.cat.voice,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("look, voice, meows(storage_path, blocked)")
    .single();
  if (error) throw error;
  const saved = toSavedCat({ row: data, getPublicUrl: createMeowStorage(options.client).getPublicUrl });
  if (saved === undefined) throw new Error("Saved cat row did not parse");
  return saved;
}
