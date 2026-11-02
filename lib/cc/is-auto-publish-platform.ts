import {
  AUTO_PUBLISH_PLATFORM_IDS,
  type AutoPublishPlatformId,
} from "./auto-publish-platforms";

/** `true` if CC can publish posts on `platform` by itself; `false` otherwise. */
export function isAutoPublishPlatform(
  platform: string
): platform is AutoPublishPlatformId {
  return AUTO_PUBLISH_PLATFORM_IDS.some((id) => id === platform);
}
