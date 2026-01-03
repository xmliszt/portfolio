import "server-only";

// Header images for changelog versions, organized by app ID
export const CHANGELOG_HEADER_IMAGES: Record<string, Record<string, string>> = {
  joodle: {
    "1.0.63":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.63.gif",
    "1.0.62":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.62.gif",
    "1.0.61":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.61.gif",
    "1.0.58":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.58.png",
    "1.0.54":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.0.54.png",
  },
};

export function getChangelogHeaderImage(
  appId: string,
  version: string
): string | undefined {
  return CHANGELOG_HEADER_IMAGES[appId]?.[version];
}
