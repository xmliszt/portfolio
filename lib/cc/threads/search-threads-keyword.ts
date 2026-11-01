import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";

type KeywordSearchPage = { data: { id: string; timestamp?: string }[] };

/** Return up to `limit` of the most recent public threads that match `q`, as a tag search when `mode` is 'TAG'. */
export async function searchThreadsKeyword(options: {
  accessToken: string;
  q: string;
  mode: "KEYWORD" | "TAG";
  limit: number;
}) {
  const url = new URL("/v1.0/keyword_search", THREADS_GRAPH_ORIGIN);
  url.searchParams.set("q", options.q);
  url.searchParams.set("search_type", "RECENT");
  url.searchParams.set("search_mode", options.mode);
  url.searchParams.set("limit", String(options.limit));
  url.searchParams.set("fields", "id,timestamp");
  url.searchParams.set("access_token", options.accessToken);
  return callThreadsApi<KeywordSearchPage>({ url });
}
