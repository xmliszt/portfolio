import sum from "lodash/sum.js";

import type { ThreadsInsight } from "./threads/threads-insight";

/** Map Threads media insights to `post_metrics` fields: views, likes, replies as comments, and reposts + quotes + shares as shares; a field is `undefined` when Threads returned none of its metrics. */
export function toThreadsMetricValues(insights: readonly ThreadsInsight[]) {
  function read(name: string) {
    const insight = insights.find((entry) => entry.name === name);
    return insight?.values?.at(0)?.value ?? insight?.total_value?.value;
  }
  const shareParts = ["reposts", "quotes", "shares"].flatMap((name) => {
    const value = read(name);
    return value === undefined ? [] : [value];
  });
  return {
    views: read("views"),
    likes: read("likes"),
    comments: read("replies"),
    shares: shareParts.length === 0 ? undefined : sum(shareParts),
  };
}
