import { NextResponse } from "next/server";

import { Alert } from "./alerts/types";

// Set to null to disable alerts
const ACTIVE_ALERT: Alert | null = null;

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
