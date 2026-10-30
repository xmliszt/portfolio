import "server-only";

import type { SavedCat } from "@/lib/paws/cat-api-types";

import type { PawsServiceClient } from "./paws-service-client";
import { toSavedCat } from "./to-saved-cat";

/** Return `userId`'s saved cat, or `undefined` when there is none. */
export async function readSavedCat(options: {
  client: PawsServiceClient;
  userId: string;
}): Promise<SavedCat | undefined> {
  const { data, error } = await options.client
    .from("cats")
    .select("look, voice")
    .eq("user_id", options.userId)
    .maybeSingle();
  if (error) throw error;
  return toSavedCat(data);
}
