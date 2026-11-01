"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Delete the stored Threads token. */
export async function disconnectThreads() {
  await requireCcOwner();
  const { error } = await createCcServiceClient()
    .from("integrations")
    .delete()
    .eq("provider", "threads");
  if (error) throw error;
  revalidatePath("/cc", "layout");
}
