"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { setFocusCookie } from "@/lib/cc/data/set-focus-cookie";

/** Make `campaignId` the focused campaign for this browser, then go to `redirectTo` when it is set. */
export async function focusCampaign(options: {
  campaignId: string;
  redirectTo?: "/composer";
}) {
  await requireCcOwner();
  await setFocusCookie(options.campaignId);
  revalidatePath("/cc", "layout");
  if (options.redirectTo !== undefined) redirect(options.redirectTo);
}
