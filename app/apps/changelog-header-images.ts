import "server-only";

// Header images for changelog versions, organized by app ID
export const CHANGELOG_HEADER_IMAGES: Record<
  string,
  Record<string, string[]>
> = {
  joodle: {
    "2.0.163": [
      "https://joodle.liyuxuan.dev/changelogs/2.0_1.mp4",
      "https://joodle.liyuxuan.dev/changelogs/2.0_2.mp4",
    ],
    "1.18.145": [
      "https://joodle.liyuxuan.dev/changelogs/1.18_1.png",
      "https://joodle.liyuxuan.dev/changelogs/1.18_2.png",
      "https://joodle.liyuxuan.dev/changelogs/1.18_3.gif",
    ],
    "1.17.141": ["https://joodle.liyuxuan.dev/changelogs/1.17.png"],
    "1.16.116": ["https://joodle.liyuxuan.dev/changelogs/1.16.gif"],
    "1.15.114": ["https://joodle.liyuxuan.dev/changelogs/1.15.gif"],
    "1.14.111": ["https://joodle.liyuxuan.dev/changelogs/1.14.png"],
    // App store version 1.12 release
    "1.12.102": ["https://joodle.liyuxuan.dev/changelogs/1.12.gif"],
    // App store version 1.11 release
    "1.11.99": ["https://joodle.liyuxuan.dev/changelogs/1.11.png"],
    // App store version 1.10 release
    "1.10.98": ["https://joodle.liyuxuan.dev/changelogs/1.10.png"],
    // App store version 1.8 release
    "1.8.91": ["https://joodle.liyuxuan.dev/changelogs/1.8.91.png"],
    // App store version 1.7 release
    "1.7.89": ["https://joodle.liyuxuan.dev/changelogs/1.7.89.gif"],
    // App store version 1.5 release
    "1.5.83": ["https://joodle.liyuxuan.dev/changelogs/1.5.83.gif"],
    // App store version 1.4 release
    "1.4.79": ["https://joodle.liyuxuan.dev/changelogs/1.4.79.gif"],
    // App store version 1.3 release
    "1.3.78": ["https://joodle.liyuxuan.dev/changelogs/1.3.78.gif"],
    // App store version 1.1 release
    "1.1.73": ["https://joodle.liyuxuan.dev/changelogs/1.1.73.gif"],
    // TestFlight last release
    "1.1.68": ["https://joodle.liyuxuan.dev/changelogs/1.1.68.gif"],
    "1.0.58": ["https://joodle.liyuxuan.dev/changelogs/1.0.58.png"],
    "1.0.54": ["https://joodle.liyuxuan.dev/changelogs/1.0.54.png"],
  },
};

export function getChangelogHeaderImage(
  appId: string,
  version: string
): string[] | undefined {
  return CHANGELOG_HEADER_IMAGES[appId]?.[version];
}
