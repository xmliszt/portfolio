import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

import { getLocalizedContentPath, resolveLocale } from "@/lib/i18n";

const ACTIVE_ALERT_JSON: string | null = "2026-mar-giveaway-2026-03.json";

export type Alert = {
  id: string;
  title: string;
  message: string;
  type: string;
  primaryButton?: {
    text: string;
    url: string;
  };
  secondaryButton?: {
    text: string;
  };
  dismissible?: boolean;
  startDate?: string;
  endDate?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedLocale = searchParams.get("locale");
  const effectiveLocale = resolveLocale(requestedLocale);

  // If no alert is active, we return null.
  if (!ACTIVE_ALERT_JSON) {
    return NextResponse.json(
      { alert: null },
      {
        headers: {
          "Content-Language": effectiveLocale,
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          Vary: "Accept-Encoding, locale",
        },
      }
    );
  }

  let activeAlert: Alert | null = null;

  try {
    const contentPath = getLocalizedContentPath("joodle", effectiveLocale);
    const alertsDir = path.join(contentPath, "alerts");

    if (fs.existsSync(alertsDir)) {
      // For now, we'll support a single active alert (whatsapp invitation)
      // In future we can add logic to select active alert based on date ranges
      const activeAlertPath = path.join(alertsDir, ACTIVE_ALERT_JSON);
      if (fs.existsSync(activeAlertPath)) {
        activeAlert = JSON.parse(fs.readFileSync(activeAlertPath, "utf-8"));
      }
    }
  } catch (error) {
    console.error("Error loading alert:", error);
  }

  return NextResponse.json(
    { alert: activeAlert },
    {
      headers: {
        "Content-Language": effectiveLocale,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        Vary: "Accept-Encoding, locale",
      },
    }
  );
}
