import fs from "fs";
import { NextResponse } from "next/server";

import { CHANGELOGS_DIR, HEADER_IMAGES } from "./constants";

type ChangelogIndexEntry = {
  version: string;
  displayVersion: string;
  date: string;
  headerImageURL: string | null;
};

// GET /api/changelogs - Returns the changelog index
export async function GET() {
  try {
    // Check if directory exists
    if (!fs.existsSync(CHANGELOGS_DIR)) {
      return NextResponse.json({ changelogs: [] });
    }

    const files = fs
      .readdirSync(CHANGELOGS_DIR)
      .filter((f) => f.endsWith(".md"));

    const changelogs: ChangelogIndexEntry[] = files
      .map((filename) => {
        // Parse filename: 1.0.61_2025-12-30.md
        const baseName = filename.replace(".md", "");
        const [version, date] = baseName.split("_");

        if (!version || !date) {
          console.warn(`Invalid changelog filename format: ${filename}`);
          return null;
        }

        const [major, minor, build] = version.split(".").map(Number);
        const displayVersion = `${major}.${minor} (${build})`;

        return {
          version,
          displayVersion,
          date,
          headerImageURL: HEADER_IMAGES[version] || null,
        };
      })
      .filter((entry): entry is ChangelogIndexEntry => entry !== null)
      // Sort by version (newest first)
      .sort((a, b) => compareVersions(b.version, a.version));

    return NextResponse.json({ changelogs });
  } catch (error) {
    console.error("Error reading changelogs:", error);
    return NextResponse.json(
      { error: "Failed to load changelogs" },
      { status: 500 }
    );
  }
}

function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const p1 = v1Parts[i] || 0;
    const p2 = v2Parts[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}
