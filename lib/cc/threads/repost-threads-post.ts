import "server-only";

import type { PublishResult } from "@/lib/cc/publish-result";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";

/** Repost Threads post `mediaId` as the account, with no text of its own, and return the repost's id (or the original's when Threads returns none) and `permalink`, or Threads' error. */
export async function repostThreadsPost(options: {
  accessToken: string;
  mediaId: string;
  permalink: string | undefined;
}): Promise<PublishResult> {
  const url = new URL(`/v1.0/${options.mediaId}/repost`, THREADS_GRAPH_ORIGIN);
  url.searchParams.set("access_token", options.accessToken);
  const reposted = await callThreadsApi<{ id?: string }>({
    url,
    init: { method: "POST" },
  });
  if (reposted.kind === "error") {
    return {
      kind: "error",
      message:
        reposted.status === 0
          ? `Lost the connection to Threads while reposting (${reposted.message}), so it may or may not be reposted. Check Threads before you try again.`
          : `Threads repost failed: ${reposted.message}.`,
    };
  }
  return {
    kind: "ok",
    platformPostId: reposted.data.id ?? options.mediaId,
    url: options.permalink,
  };
}
