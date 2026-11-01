import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";

type ThreadsPage = {
  data: { id: string; permalink?: string; timestamp?: string }[];
};

/** Return the account's most recent threads (up to `limit`) with their permalinks and timestamps. */
export async function listMyThreads(options: {
  accessToken: string;
  limit: number;
}) {
  const url = new URL("/v1.0/me/threads", THREADS_GRAPH_ORIGIN);
  url.searchParams.set("fields", "id,permalink,timestamp");
  url.searchParams.set("limit", String(options.limit));
  url.searchParams.set("access_token", options.accessToken);
  return callThreadsApi<ThreadsPage>({ url });
}
