"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { CampaignPlan } from "@/lib/cc/campaign-plan";
import { parseCampaignPlan } from "@/lib/cc/parse-campaign-plan";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toCampaignPlanJson } from "@/lib/cc/to-campaign-plan-json";

/** Save `plan` as `campaignId`'s planner settings, with out-of-range fields replaced by the defaults, and return what was saved. */
export async function saveCampaignPlan(options: {
  campaignId: string;
  plan: CampaignPlan;
}) {
  await requireCcOwner();
  const plan = parseCampaignPlan(toCampaignPlanJson(options.plan));
  const { error } = await createCcServiceClient()
    .from("campaigns")
    .update({ plan: toCampaignPlanJson(plan) })
    .eq("id", options.campaignId);
  if (error) throw error;
  revalidatePath("/cc", "layout");
  return plan;
}
