"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Add a learnings note with `body` to the campaign and return it. */
export async function createNote(options: {
  campaignId: string;
  body: string;
}) {
  await requireCcOwner();
  const body = options.body.trim();
  if (body === "") throw new Error("A note needs some text");
  const { data, error } = await createCcServiceClient()
    .from("notes")
    .insert({ campaign_id: options.campaignId, body })
    .select("*")
    .single();
  if (error) throw error;
  revalidatePath("/cc", "layout");
  return data;
}
