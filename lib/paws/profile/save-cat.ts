import "server-only";

import type { PutCatRequest, SavedCat } from "@/lib/paws/cat-api-types";

import type { PawsServiceClient } from "./paws-service-client";
import { toSavedCat } from "./to-saved-cat";

/** Create or update `userId`'s cat look and voice, and return the saved cat. */
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
    .select("look, voice")
    .single();
  if (error) throw error;
  const saved = toSavedCat(data);
  if (saved === undefined) throw new Error("Saved cat row did not parse");
  return saved;
}
