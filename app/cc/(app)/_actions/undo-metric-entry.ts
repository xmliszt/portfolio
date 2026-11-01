"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { undoLastMetricEntry } from "@/lib/cc/data/undo-last-metric-entry";

/** Delete the newest metric entry, wherever it was logged, and return its id, post and checkpoint, or `undefined` when there is none. */
export async function undoMetricEntry() {
  await requireCcOwner();
  const removed = await undoLastMetricEntry();
  revalidatePath("/cc", "layout");
  return removed === undefined
    ? undefined
    : {
        metricId: removed.id,
        postId: removed.post_id,
        checkpoint: removed.checkpoint,
      };
}
