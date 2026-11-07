"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { CampaignRow } from "@/lib/cc/data/cc-rows";
import { setFocusCookie } from "@/lib/cc/data/set-focus-cookie";
import { deriveCampaignCode } from "@/lib/cc/derive-campaign-code";
import { isCampaignColor } from "@/lib/cc/is-campaign-color";
import { normaliseCampaignCode } from "@/lib/cc/normalise-campaign-code";
import { pickCampaignColor } from "@/lib/cc/pick-campaign-color";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

type CampaignFields = Pick<
  CampaignRow,
  "name" | "link" | "starts_at" | "notes" | "code" | "color"
>;

/** Create a campaign (when `campaignId` is unset) and focus it, or update `campaignId` with `fields`, and return the saved campaign; a new campaign with an empty `code` gets one from its name, and one with an empty `color` gets the least used colour. */
export async function saveCampaign(options: {
  campaignId?: string;
  fields: CampaignFields;
}) {
  await requireCcOwner();
  const name = options.fields.name.trim();
  if (name === "") throw new Error("A campaign needs a name");
  const isNew = options.campaignId === undefined;
  if (isNew && options.fields.starts_at === null) {
    throw new Error("A new campaign needs a start date");
  }
  const code =
    options.fields.code.trim() === "" && isNew
      ? deriveCampaignCode(name)
      : normaliseCampaignCode(options.fields.code);
  if (code === undefined) {
    throw new Error("The code needs 2–4 letters or digits");
  }
  const supabase = createCcServiceClient();
  async function pickColor() {
    const { data, error } = await supabase.from("campaigns").select("color");
    if (error) throw error;
    return pickCampaignColor(data.map((row) => row.color));
  }
  const color = isCampaignColor(options.fields.color)
    ? options.fields.color
    : isNew
      ? await pickColor()
      : undefined;
  if (color === undefined) throw new Error("Pick a colour");
  const fields = { ...options.fields, name, code, color };
  const { data, error } = await (
    options.campaignId === undefined
      ? supabase.from("campaigns").insert(fields)
      : supabase.from("campaigns").update(fields).eq("id", options.campaignId)
  )
    .select("*")
    .single();
  if (error) throw error;
  if (isNew) await setFocusCookie(data.id);
  revalidatePath("/cc", "layout");
  return data;
}
