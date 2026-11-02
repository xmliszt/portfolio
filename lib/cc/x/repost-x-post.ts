import "server-only";

import type { PublishResult } from "@/lib/cc/publish-result";

import { callXApi } from "./call-x-api";
import { getXUserId } from "./get-x-user-id";
import type { XUserCredentials } from "./x-user-credentials";

/** Repost X post `postId` as the owner, with no text of its own, and return the reposted post's id and URL, or X's error. */
export async function repostXPost(options: {
  credentials: XUserCredentials;
  postId: string;
}): Promise<PublishResult> {
  const userId = await getXUserId({ credentials: options.credentials });
  if (userId.kind === "error") {
    return {
      kind: "error",
      message: `X did not return your user id: ${userId.message}`,
    };
  }
  const reposted = await callXApi<{
    data: { rest_id?: string; retweeted: boolean };
  }>({
    method: "POST",
    url: new URL(`https://api.x.com/2/users/${userId.data}/retweets`),
    credentials: options.credentials,
    body: { kind: "json", value: { tweet_id: options.postId } },
  });
  if (reposted.kind === "error") {
    return {
      kind: "error",
      message:
        reposted.status === 0
          ? `Lost the connection to X while reposting (${reposted.message}), so it may or may not be reposted. Check X before you try again.`
          : `X (${reposted.status}): ${reposted.message}`,
    };
  }
  return {
    kind: "ok",
    platformPostId: options.postId,
    url: `https://x.com/i/web/status/${options.postId}`,
  };
}
