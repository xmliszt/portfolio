import "server-only";

import { downloadAsset } from "@/lib/cc/data/download-asset";
import type { PublishMedia } from "@/lib/cc/publish-media";

export const BLUESKY_MAX_IMAGE_BYTES = 2_000_000;

/** Return the message for the first image in `media` over Bluesky's 2 MB limit, reading each image's size from storage, or `undefined` when all fit. */
export async function findOversizedBlueskyImage(options: {
  media: readonly PublishMedia[];
}) {
  for (const media of options.media.filter((item) => item.kind === "image")) {
    const bytes = await downloadAsset({ path: media.path });
    if (bytes.size > BLUESKY_MAX_IMAGE_BYTES) {
      return `${media.path.split("/").at(-1)} is over Bluesky's 2 MB image limit.`;
    }
  }
  return undefined;
}
