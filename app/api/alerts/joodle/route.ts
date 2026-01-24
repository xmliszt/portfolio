import { NextResponse } from "next/server";

import { Alert } from "./alerts/types";
import { WHATSAPP_INVITATION_ALERT } from "./alerts/whatsapp-invitation-alert";

// Set to null to disable alerts
const ACTIVE_ALERT: Alert | null = WHATSAPP_INVITATION_ALERT;

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
