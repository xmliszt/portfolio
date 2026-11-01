import type { PostAsset } from "@/lib/cc/post-asset";

export type DraftFields = {
  title: string;
  body: string;
  hashtagsText: string;
  target: string;
  link: string;
  assets: readonly PostAsset[];
};
