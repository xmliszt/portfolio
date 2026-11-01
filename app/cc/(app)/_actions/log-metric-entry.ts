"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { saveMetricEntry } from "@/lib/cc/data/save-metric-entry";
import { METRIC_FIELDS, type MetricField } from "@/lib/cc/platforms";
import type { MetricCheckpoint } from "@/lib/cc/stats-types";

const CHECKPOINTS = ["1h", "24h", "7d", "extra"] as const;

/** Save one metric entry for `postId` at `checkpoint` and return the saved row's id with its views against the platform median. */
export async function logMetricEntry(options: {
  postId: string;
  checkpoint: MetricCheckpoint;
  values: { [field in MetricField]?: number | undefined };
}) {
  await requireCcOwner();
  if (!CHECKPOINTS.includes(options.checkpoint)) {
    throw new Error(`Unknown checkpoint ${options.checkpoint}`);
  }
  const values = Object.fromEntries(
    Object.entries(options.values).flatMap(([field, value]) => {
      if (value === undefined) return [];
      if (!METRIC_FIELDS.some((known) => known === field)) {
        throw new Error(`Unknown metric ${field}`);
      }
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${field} must be a whole number of 0 or more`);
      }
      return [[field, value]];
    })
  );
  const saved = await saveMetricEntry({
    postId: options.postId,
    checkpoint: options.checkpoint,
    values,
  });
  revalidatePath("/cc", "layout");
  return {
    metricId: saved.metric.id,
    ratio: saved.ratio,
    platformId: saved.platformId,
  };
}
