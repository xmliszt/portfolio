"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { CampaignRow } from "@/lib/cc/data/cc-rows";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type CampaignFields = Pick<
  CampaignRow,
  "name" | "link" | "starts_at" | "notes"
>;

/** Create a campaign (when `campaignId` is unset) or update `campaignId` with `fields`, and return the saved campaign. */
export async function saveCampaign(options: {
  campaignId?: string;
  fields: CampaignFields;
}) {
  await requireCcOwner();
  const fields = { ...options.fields, name: options.fields.name.trim() };
  if (fields.name === "") throw new Error("A campaign needs a name");
  if (options.campaignId === undefined && fields.starts_at === null) {
    throw new Error("A new campaign needs a start date");
  }
  const supabase = createCcServiceClient();
  const { data, error } = await (
    options.campaignId === undefined
      ? supabase.from("campaigns").insert(fields)
      : supabase.from("campaigns").update(fields).eq("id", options.campaignId)
  )
    .select("*")
    .single();
  if (error) throw error;
  revalidatePath("/cc", "layout");
  return data;
}
