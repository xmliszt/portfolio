import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";
import type { ThreadsApiResult } from "./threads-api-result";

type RefreshedToken = { access_token: string; expires_in: number };

/** Refresh a long-lived Threads token and return the new token with its expiry counted from `now`. */
export async function refreshThreadsToken(options: {
  accessToken: string;
  now: Date;
}): Promise<ThreadsApiResult<{ accessToken: string; expiresAt: Date }>> {
  const url = new URL("/refresh_access_token", THREADS_GRAPH_ORIGIN);
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", options.accessToken);
  const result = await callThreadsApi<RefreshedToken>({ url });
  if (result.kind === "error") return result;
  return {
    kind: "ok",
    data: {
      accessToken: result.data.access_token,
      expiresAt: new Date(
        options.now.getTime() + result.data.expires_in * 1000
      ),
    },
  };
}
