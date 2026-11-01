import type { PlatformId } from "@/lib/cc/platforms";

export type ComposerTab = {
  postId: string;
  platformId: PlatformId;
  label: string;
  detail: string | undefined;
  isPosted: boolean;
};
