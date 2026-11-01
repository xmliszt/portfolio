"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Stop tracking the keyword `keywordId`, keeping its counts. */
export async function archiveKeyword(options: { keywordId: string }) {
  await requireCcOwner();
  const { error } = await createCcServiceClient()
    .from("keywords")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", options.keywordId);
  if (error) throw error;
  revalidatePath("/cc", "layout");
}
