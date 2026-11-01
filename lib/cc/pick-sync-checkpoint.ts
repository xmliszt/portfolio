import { formatSgt } from "./format-sgt";
import type { MetricCheckpoint } from "./stats-types";

const HOUR_MS = 3_600_000;

/** Return the checkpoint a synced metric row for a post posted at `postedAt` is due for at `now` — '24h' from 20 to 48 h, '7d' from 6.5 to 8 days, 'extra' otherwise — or `undefined` when `postedAt` is after `now` or `existing` already has that checkpoint ('extra': already on `now`'s SGT day). */
export function pickSyncCheckpoint(options: {
  postedAt: Date;
  now: Date;
  existing: readonly { checkpoint: MetricCheckpoint; capturedAt: Date }[];
}): MetricCheckpoint | undefined {
  const ageHours =
    (options.now.getTime() - options.postedAt.getTime()) / HOUR_MS;
  if (ageHours < 0) return undefined;
  function hasCheckpoint(checkpoint: MetricCheckpoint) {
    return options.existing.some((row) => row.checkpoint === checkpoint);
  }
  if (ageHours >= 20 && ageHours <= 48) {
    return hasCheckpoint("24h") ? undefined : "24h";
  }
  if (ageHours >= 6.5 * 24 && ageHours <= 8 * 24) {
    return hasCheckpoint("7d") ? undefined : "7d";
  }
  const today = formatSgt({ date: options.now, pattern: "yyyy-MM-dd" });
  const hasExtraToday = options.existing.some(
    (row) =>
      row.checkpoint === "extra" &&
      formatSgt({ date: row.capturedAt, pattern: "yyyy-MM-dd" }) === today
  );
  return hasExtraToday ? undefined : "extra";
}
