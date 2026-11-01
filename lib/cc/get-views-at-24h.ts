import { getLatestMetric } from "./get-latest-metric";
import type { StatMetric } from "./stats-types";

/** Return the views on the latest 24h metric row for `postId`, or `undefined` when none was logged. */
export function getViewsAt24h(options: {
  metrics: readonly StatMetric[];
  postId: string;
}) {
  return getLatestMetric({
    metrics: options.metrics,
    postId: options.postId,
    checkpoint: "24h",
  })?.views;
}
