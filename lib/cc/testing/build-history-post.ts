import type { PlatformId } from "@/lib/cc/platforms";
import type { CampaignHistoryPost } from "@/lib/cc/summarise-campaign-history";

/** Return a posted laundro.cafe history post on `platformId` at `at`, with the given first line and 24 h views against a median of 100. */
export function buildHistoryPost(options: {
  platformId: PlatformId;
  at: string;
  firstLine?: string;
  views24h?: number;
  isPosted?: boolean;
  assetFiles?: readonly string[];
  target?: string;
}): CampaignHistoryPost {
  return {
    host: "laundro.cafe",
    platformId: options.platformId,
    at: new Date(options.at),
    isPosted: options.isPosted ?? true,
    firstLine: options.firstLine ?? `A post on ${options.at}`,
    views24h: options.views24h,
    medianViews24h: 100,
    assetFiles: options.assetFiles ?? [],
    target: options.target,
  };
}
