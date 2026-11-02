import "server-only";

import { callXApi } from "./call-x-api";
import type { XApiResult } from "./x-api-result";
import type { XUserCredentials } from "./x-user-credentials";

/** Return the owner's X user id: the digits before the dash in an OAuth 1.0a access token, or `GET /2/users/me` when the token has no such prefix. */
export async function getXUserId(options: {
  credentials: XUserCredentials;
}): Promise<XApiResult<string>> {
  const prefix = /^(\d{1,19})-/.exec(options.credentials.accessToken)?.at(1);
  if (prefix !== undefined) return { kind: "ok", data: prefix };
  const me = await callXApi<{ data: { id: string } }>({
    method: "GET",
    url: new URL("https://api.x.com/2/users/me"),
    credentials: options.credentials,
  });
  return me.kind === "ok" ? { kind: "ok", data: me.data.data.id } : me;
}
