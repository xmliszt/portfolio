export const AUTO_PUBLISH_PLATFORM_IDS = ["x", "threads", "bluesky"] as const;

export type AutoPublishPlatformId = (typeof AUTO_PUBLISH_PLATFORM_IDS)[number];
