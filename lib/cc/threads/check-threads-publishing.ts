import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";

/** Ask Threads for the account's publishing quota, which only answers when the token carries `threads_content_publish`, and return the error when it refuses. */
export async function checkThreadsPublishing(options: { accessToken: string }) {
  const url = new URL(
    "/v1.0/me/threads_publishing_limit",
    THREADS_GRAPH_ORIGIN
  );
  url.searchParams.set("fields", "quota_usage");
  url.searchParams.set("access_token", options.accessToken);
  return callThreadsApi<unknown>({ url });
}
