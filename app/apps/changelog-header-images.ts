import "server-only";

// Header images for changelog versions, organized by app ID
export const CHANGELOG_HEADER_IMAGES: Record<string, Record<string, string>> = {
  joodle: {
    // App store version 1.7 release
    "1.7.89":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.7.89.gif",
    // App store version 1.5 release
    "1.5.83":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.5.83.gif",
    // App store version 1.4 release
    "1.4.79":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.4.79.gif",
    // App store version 1.3 release
    "1.3.78":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.3.78.gif",
    // App store version 1.1 release
    "1.1.73":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.1.73.gif",
    // TestFlight last release
    "1.1.68":
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Changelogs/1.1.68.gif",
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
