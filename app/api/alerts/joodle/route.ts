import { NextResponse } from "next/server";

import { DISCORD_INVITATION_ALERT } from "./alerts/discord-invitation-alert";
import { Alert } from "./alerts/types";

// Set to null to disable alerts
const ACTIVE_ALERT: Alert | null = DISCORD_INVITATION_ALERT;

export async function GET() {
  return NextResponse.json(
    { alert: ACTIVE_ALERT },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
