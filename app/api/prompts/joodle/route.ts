import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

import { getLocalizedContentPath, resolveLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLocale = searchParams.get("locale");
    const effectiveLocale = resolveLocale(requestedLocale);

    const contentPath = getLocalizedContentPath("joodle", effectiveLocale);
    const promptsPath = path.join(contentPath, "prompts", "prompts.json");
    const promptsData = JSON.parse(fs.readFileSync(promptsPath, "utf-8"));

    return NextResponse.json(promptsData, {
      headers: {
        "Content-Language": effectiveLocale,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        Vary: "Accept-Encoding, locale",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load prompts" },
      { status: 500 }
    );
  }
}
