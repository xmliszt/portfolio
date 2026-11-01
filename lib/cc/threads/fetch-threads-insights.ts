import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";
import type { ThreadsInsight } from "./threads-insight";

const METRICS = ["views", "likes", "replies", "reposts", "quotes", "shares"];

/** Return the lifetime insights of the thread `mediaId`. */
export async function fetchThreadsInsights(options: {
  accessToken: string;
  mediaId: string;
}) {
  const url = new URL(
    `/v1.0/${encodeURIComponent(options.mediaId)}/insights`,
    THREADS_GRAPH_ORIGIN
  );
  url.searchParams.set("metric", METRICS.join(","));
  url.searchParams.set("access_token", options.accessToken);
  return callThreadsApi<{ data: ThreadsInsight[] }>({ url });
}
