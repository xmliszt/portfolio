import "server-only";

import path from "path";

import { CHANGELOG_HEADER_IMAGES } from "@/app/apps/changelog-data";

// Directory where changelog markdown files are stored
export const CHANGELOGS_DIR = path.join(
  process.cwd(),
  "content/apps/joodle/changelogs"
);

// Optional: Map versions to header image URLs
export const HEADER_IMAGES: Record<string, string> =
  CHANGELOG_HEADER_IMAGES["joodle"] ?? {};
