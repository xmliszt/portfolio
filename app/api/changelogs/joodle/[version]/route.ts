import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import { HEADER_IMAGES } from "@/app/api/changelogs/joodle/constants";
import { getLocalizedContentPath, resolveLocale } from "@/lib/i18n";

type ChangelogDetailResponse = {
  version: string;
  displayVersion: string;
  date: string;
  headerImageURL: string | null;
  markdown: string;
};

// GET /api/changelogs/[version] - Returns full changelog for a specific version
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const { version } = await params;
    const { searchParams } = new URL(request.url);
    const requestedLocale = searchParams.get("locale");
    const effectiveLocale = resolveLocale(requestedLocale);

    const contentPath = getLocalizedContentPath("joodle", effectiveLocale);
    const changelogsDir = path.join(contentPath, "changelogs");

    // Check if directory exists
    if (!fs.existsSync(changelogsDir)) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    // Find the file matching this version
    const files = fs.readdirSync(changelogsDir);
    const matchingFile = files.find(
      (f) => f.startsWith(`${version}_`) && f.endsWith(".md")
    );

    if (!matchingFile) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    // Parse filename for date
    const baseName = matchingFile.replace(".md", "");
    const [, date] = baseName.split("_");

    // Read markdown content
    const filePath = path.join(changelogsDir, matchingFile);
    const markdown = fs.readFileSync(filePath, "utf-8");

    // Generate display version
    const [major, minor, build] = version.split(".").map(Number);
    const displayVersion = `${major}.${minor} (${build})`;

    const response: ChangelogDetailResponse = {
      version,
      displayVersion,
      date: date || "",
      headerImageURL: HEADER_IMAGES[version] || null,
      markdown,
    };

    return NextResponse.json(response, {
      headers: {
        "Content-Language": effectiveLocale,
        "Cache-Control": "s-maxage=31536000, stale-while-revalidate=86400",
        Vary: "Accept-Encoding, locale",
      },
    });
  } catch (error) {
    console.error("Error reading changelog:", error);
    return NextResponse.json(
      { error: "Failed to load changelog" },
      { status: 500 }
    );
  }
}
