import "server-only";

import { cookies } from "next/headers";

import { CC_FOCUS_COOKIE } from "@/lib/cc/campaign-focus-cookie";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { getCurrentCampaign } from "./get-current-campaign";

/** Return the campaign named by the focus cookie, or the campaign with the latest `starts_at` when the cookie is unset or names no campaign; `undefined` when there is no campaign. */
export async function getFocusedCampaign() {
  const focusedId = (await cookies()).get(CC_FOCUS_COOKIE)?.value;
  if (focusedId === undefined || !/^[0-9a-f-]{36}$/.test(focusedId)) {
    return getCurrentCampaign();
  }
  const { data, error } = await createCcServiceClient()
    .from("campaigns")
    .select("*")
    .eq("id", focusedId)
    .maybeSingle();
  if (error) throw error;
  return data ?? getCurrentCampaign();
}
