import maxBy from "lodash/maxBy.js";

import { addDays } from "./add-days";
import { formatSgt } from "./format-sgt";
import type { PlatformId } from "./platforms";
import { REPOST_STRATEGY } from "./repost-strategy";
import type { CampaignHistoryPost } from "./summarise-campaign-history";

const DAY_MS = 24 * 60 * 60 * 1000;

type GapBase = { platformId: PlatformId; minGapDays: number };

type GapSinceLast = GapBase & {
  lastAt: Date;
  /** Days from the last post's SGT day to `startDate`. */
  daysSince: number;
  /** First SGT day ("yyyy-MM-dd") past `REPOST_STRATEGY`'s gap. */
  readyOn: string;
};

/** Where a platform stands against its `REPOST_STRATEGY` gap when the campaign starts. */
export type RepostGap =
  | (GapBase & { kind: "no-history" })
  | (GapSinceLast & { kind: "ready" | "wait" | "after-window" });

/** Return, for each of `platformIds`, how long before `startDate` its last posted or scheduled post in `posts` went out, and whether the campaign starting `startDate` and running `lengthDays` is past the platform's `REPOST_STRATEGY` gap by then, must wait for it inside the window, or only clears it after the window. */
export function getRepostGaps(options: {
  posts: readonly CampaignHistoryPost[];
  platformIds: readonly PlatformId[];
  startDate: string;
  lengthDays: number;
}) {
  const windowEnd = addDays({
    day: options.startDate,
    days: options.lengthDays,
  });
  return options.platformIds.map((platformId): RepostGap => {
    const minGapDays = REPOST_STRATEGY[platformId].minGapDays;
    const last = maxBy(
      options.posts.filter((post) => post.platformId === platformId),
      (post) => post.at.getTime()
    );
    if (last === undefined)
      return { kind: "no-history", platformId, minGapDays };
    const lastDay = formatSgt({ date: last.at, pattern: "yyyy-MM-dd" });
    const daysSince = Math.round(
      (Date.parse(options.startDate) - Date.parse(lastDay)) / DAY_MS
    );
    const readyOn = addDays({ day: lastDay, days: minGapDays });
    const base = {
      platformId,
      minGapDays,
      lastAt: last.at,
      daysSince,
      readyOn,
    };
    if (readyOn <= options.startDate) return { ...base, kind: "ready" };
    return { ...base, kind: readyOn < windowEnd ? "wait" : "after-window" };
  });
}
