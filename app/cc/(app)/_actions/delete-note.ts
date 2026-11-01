"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Delete the learnings note `noteId`. */
export async function deleteNote(options: { noteId: string }) {
  await requireCcOwner();
  const { error } = await createCcServiceClient()
    .from("notes")
    .delete()
    .eq("id", options.noteId);
  if (error) throw error;
  revalidatePath("/cc", "layout");
}
