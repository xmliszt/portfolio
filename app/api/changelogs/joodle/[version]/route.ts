import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import {
  CHANGELOGS_DIR,
  HEADER_IMAGES,
} from "@/app/api/changelogs/joodle/constants";

type ChangelogDetailResponse = {
  version: string;
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

    // Check if directory exists
    if (!fs.existsSync(CHANGELOGS_DIR)) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    // Find the file matching this version
    const files = fs.readdirSync(CHANGELOGS_DIR);
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
    const filePath = path.join(CHANGELOGS_DIR, matchingFile);
    const markdown = fs.readFileSync(filePath, "utf-8");

    const response: ChangelogDetailResponse = {
      version,
      date: date || "",
      headerImageURL: HEADER_IMAGES[version] || null,
      markdown,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error reading changelog:", error);
    return NextResponse.json(
      { error: "Failed to load changelog" },
      { status: 500 }
    );
  }
}
