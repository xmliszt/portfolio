import maxBy from "lodash/maxBy.js";
import minBy from "lodash/minBy.js";
import range from "lodash/range.js";
import sumBy from "lodash/sumBy.js";

import { getSgtParts } from "./get-sgt-parts";
import { PLATFORM_IDS } from "./platforms";
import type { StatMetric, StatPost } from "./stats-types";

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getSgtDayEnd(date: Date) {
  const parts = getSgtParts(date);
  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + 1) - SGT_OFFSET_MS
  );
}

/** Return, for each Singapore day from the first to the last logged view, every platform's summed views as of that day's end, using each post's latest snapshot; platforms without views are left out. */
export function getCumulativeViews(options: {
  posts: readonly StatPost[];
  metrics: readonly StatMetric[];
}) {
  const withViews = options.metrics.filter(
    (metric) => metric.views !== undefined
  );
  const first = minBy(withViews, (metric) => metric.capturedAt.getTime());
  const last = maxBy(withViews, (metric) => metric.capturedAt.getTime());
  if (first === undefined || last === undefined) {
    return { dayEnds: [], series: [] };
  }
  const firstEnd = getSgtDayEnd(first.capturedAt).getTime();
  const lastEnd = getSgtDayEnd(last.capturedAt).getTime();
  const dayEnds = range(firstEnd, lastEnd + 1, DAY_MS).map(
    (time) => new Date(time)
  );
  const series = PLATFORM_IDS.flatMap((platformId) => {
    const postIds = options.posts
      .filter((post) => post.platform === platformId)
      .map((post) => post.id);
    const platformMetrics = withViews.filter((metric) =>
      postIds.includes(metric.postId)
    );
    if (platformMetrics.length === 0) return [];
    const values = dayEnds.map((dayEnd) =>
      sumBy(postIds, (postId) => {
        const latest = maxBy(
          platformMetrics.filter(
            (metric) => metric.postId === postId && metric.capturedAt < dayEnd
          ),
          (metric) => metric.capturedAt.getTime()
        );
        return latest?.views ?? 0;
      })
    );
    return [{ platformId, values }];
  });
  return { dayEnds, series };
}
