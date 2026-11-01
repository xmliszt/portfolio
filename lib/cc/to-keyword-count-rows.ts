import type { XCountsResponse } from "./x/x-counts-response";

/** Return one `keyword_counts` row per daily bucket in `response`, keyed by the bucket's UTC start date, skipping buckets without a count. */
export function toKeywordCountRows(options: {
  keywordId: string;
  response: XCountsResponse;
  fetchedAt: Date;
}) {
  return (options.response.data ?? []).flatMap((bucket) => {
    const count = bucket.post_count;
    if (count === undefined) return [];
    return [
      {
        keyword_id: options.keywordId,
        day: new Date(bucket.start).toISOString().slice(0, 10),
        source: "x",
        count,
        fetched_at: options.fetchedAt.toISOString(),
      },
    ];
  });
}
