import type { ThreadsInsight } from "./threads/threads-insight";

/** Map Threads media insights to `post_metrics` fields: views, likes, replies as comments, reposts, quotes and shares; a field is `undefined` when Threads did not return it. */
export function toThreadsMetricValues(insights: readonly ThreadsInsight[]) {
  function read(name: string) {
    const insight = insights.find((entry) => entry.name === name);
    return insight?.values?.at(0)?.value ?? insight?.total_value?.value;
  }
  return {
    views: read("views"),
    likes: read("likes"),
    comments: read("replies"),
    reposts: read("reposts"),
    quotes: read("quotes"),
    shares: read("shares"),
  };
}
