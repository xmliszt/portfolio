import "server-only";

import path from "path";

// Directory where changelog markdown files are stored
export const CHANGELOGS_DIR = path.join(
  process.cwd(),
  "content/apps/joodle/changelogs"
);

// Optional: Map versions to header image URLs
export const HEADER_IMAGES: Record<string, string> = {
  "1.0.61":
    "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.61.gif",
  "1.0.58":
    "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.58.png",
  "1.0.54":
    "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.54.png",
};
