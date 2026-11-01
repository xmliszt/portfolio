import "server-only";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN, THREADS_REDIRECT_URI } from "./threads-api";
import type { ThreadsApiResult } from "./threads-api-result";

type ShortLivedToken = { access_token: string; user_id: string | number };
type LongLivedToken = { access_token: string; expires_in: number };
type ThreadsMe = { id: string; username?: string };

/** Trade an authorization `code` for a long-lived token and return it with its expiry and the account's id and username. */
export async function exchangeThreadsCode(options: {
  appId: string;
  appSecret: string;
  code: string;
  now: Date;
}): Promise<
  ThreadsApiResult<{
    accessToken: string;
    userId: string;
    username: string | undefined;
    expiresAt: Date;
  }>
> {
  const shortLived = await callThreadsApi<ShortLivedToken>({
    url: new URL("/oauth/access_token", THREADS_GRAPH_ORIGIN),
    init: {
      method: "POST",
      body: new URLSearchParams({
        client_id: options.appId,
        client_secret: options.appSecret,
        code: options.code,
        grant_type: "authorization_code",
        redirect_uri: THREADS_REDIRECT_URI,
      }),
    },
  });
  if (shortLived.kind === "error") return shortLived;

  const longLivedUrl = new URL("/access_token", THREADS_GRAPH_ORIGIN);
  longLivedUrl.searchParams.set("grant_type", "th_exchange_token");
  longLivedUrl.searchParams.set("client_secret", options.appSecret);
  longLivedUrl.searchParams.set("access_token", shortLived.data.access_token);
  const longLived = await callThreadsApi<LongLivedToken>({
    url: longLivedUrl,
  });
  if (longLived.kind === "error") return longLived;

  const meUrl = new URL("/v1.0/me", THREADS_GRAPH_ORIGIN);
  meUrl.searchParams.set("fields", "id,username");
  meUrl.searchParams.set("access_token", longLived.data.access_token);
  const me = await callThreadsApi<ThreadsMe>({ url: meUrl });
  if (me.kind === "error") return me;

  return {
    kind: "ok",
    data: {
      accessToken: longLived.data.access_token,
      userId: me.data.id,
      username: me.data.username,
      expiresAt: new Date(
        options.now.getTime() + longLived.data.expires_in * 1000
      ),
    },
  };
}
