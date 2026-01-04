import { NextResponse } from "next/server";

// Set to null to disable alerts
const ACTIVE_ALERT: Alert | null = null;

type AlertButton = {
  text: string;
  url?: string | null;
};

type Alert = {
  id: string;
  title: string;
  message: string;
  primaryButton: AlertButton;
  secondaryButton?: AlertButton | null;
  imageURL?: string | null;
};

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
