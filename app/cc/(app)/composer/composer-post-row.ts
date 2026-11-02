import type { PostStatusTone } from "@/app/cc/_ui/status-dot";
import type { PlatformId } from "@/lib/cc/platforms";

export type ComposerPostRow = {
  postId: string;
  platformId: PlatformId;
  name: string;
  dayLabel: string;
  timeLabel: string;
  tone: PostStatusTone;
  statusLabel: string;
};
