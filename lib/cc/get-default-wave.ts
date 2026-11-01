import type { PostAsset } from "./post-asset";

const VIDEO_FILE = /\.(mp4|mov|m4v|webm)$/i;
const IMAGE_FILE = /\.(png|jpe?g|gif|webp|heic)$/i;

/** Return the planner wave a post's `assets` suggest: 1 for a promo video, 2 for any other video, 3 for images only, or `undefined` when it has neither. */
export function getDefaultWave(assets: readonly PostAsset[]) {
  const videos = assets.filter((asset) => VIDEO_FILE.test(asset.file));
  if (videos.some((asset) => /promo/i.test(asset.file))) return 1;
  if (videos.length > 0) return 2;
  if (assets.some((asset) => IMAGE_FILE.test(asset.file))) return 3;
  return undefined;
}
