import type { PostAsset } from "@/lib/cc/post-asset";

export type DraftFields = {
  title: string;
  body: string;
  hashtagsText: string;
  target: string;
  link: string;
  originalRef: string;
  assets: readonly PostAsset[];
  /** The planner wave as select text, empty for the wave the assets suggest. */
  wave: string;
};
