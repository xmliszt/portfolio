import { NextResponse } from "next/server";

import promptsData from "./prompts.json";

export async function GET() {
  try {
    return NextResponse.json(promptsData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load prompts" },
      { status: 500 }
    );
  }
}
