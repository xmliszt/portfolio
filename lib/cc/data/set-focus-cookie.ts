import "server-only";

import { cookies } from "next/headers";

import { CC_FOCUS_COOKIE } from "@/lib/cc/campaign-focus-cookie";

/** Store `campaignId` as this browser's focused campaign for a year. */
export async function setFocusCookie(campaignId: string) {
  (await cookies()).set(CC_FOCUS_COOKIE, campaignId, {
    path: "/",
    maxAge: 31_536_000,
    sameSite: "lax",
    httpOnly: true,
  });
}
