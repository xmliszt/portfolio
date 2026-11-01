import maxBy from "lodash/maxBy.js";

import type { MetricCheckpoint, StatMetric } from "./stats-types";

/** Return the most recently captured metric row for `postId`, limited to `checkpoint` when given. */
export function getLatestMetric(options: {
  metrics: readonly StatMetric[];
  postId: string;
  checkpoint?: MetricCheckpoint;
}) {
  return maxBy(
    options.metrics.filter(
      (metric) =>
        metric.postId === options.postId &&
        (options.checkpoint === undefined ||
          metric.checkpoint === options.checkpoint)
    ),
    (metric) => metric.capturedAt.getTime()
  );
}
