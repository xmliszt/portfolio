import "server-only";

// Header images for changelog versions, organized by app ID
export const CHANGELOG_HEADER_IMAGES: Record<string, Record<string, string>> = {
  joodle: {
    "1.17.141":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.17.png",
    "1.16.116":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.16.gif",
    "1.15.114":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.15.gif",
    "1.14.111":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.14.png",
    // App store version 1.12 release
    "1.12.102":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.12.gif",
    // App store version 1.11 release
    "1.11.99":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.11.png",
    // App store version 1.10 release
    "1.10.98":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.10.png",
    // App store version 1.8 release
    "1.8.91":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.8.91.png",
    // App store version 1.7 release
    "1.7.89":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.7.89.gif",
    // App store version 1.5 release
    "1.5.83":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.5.83.gif",
    // App store version 1.4 release
    "1.4.79":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.4.79.gif",
    // App store version 1.3 release
    "1.3.78":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.3.78.gif",
    // App store version 1.1 release
    "1.1.73":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.1.73.gif",
    // TestFlight last release
    "1.1.68":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.1.68.gif",
    "1.0.58":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.0.58.png",
    "1.0.54":
      "https://raw.githubusercontent.com/xmliszt/resources/refs/heads/main/joodle/1.0.54.png",
  },
};

export function getChangelogHeaderImage(
  appId: string,
  version: string
): string | undefined {
  return CHANGELOG_HEADER_IMAGES[appId]?.[version];
}
