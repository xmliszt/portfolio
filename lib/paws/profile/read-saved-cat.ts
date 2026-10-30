import "server-only";

import type { SavedCat } from "@/lib/paws/cat-api-types";

import { createMeowStorage } from "./create-meow-storage";
import type { PawsServiceClient } from "./paws-service-client";
import { toSavedCat } from "./to-saved-cat";

const SAVED_CAT_COLUMNS = "look, voice, meows(storage_path, blocked)";

/** Return `userId`'s saved cat, or `undefined` when there is none. */
export async function readSavedCat(options: {
  client: PawsServiceClient;
  userId: string;
}): Promise<SavedCat | undefined> {
  const { data, error } = await options.client
    .from("cats")
    .select(SAVED_CAT_COLUMNS)
    .eq("user_id", options.userId)
    .maybeSingle();
  if (error) throw error;
  return toSavedCat({
    row: data,
    getPublicUrl: createMeowStorage(options.client).getPublicUrl,
  });
}
