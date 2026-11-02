import "server-only";

import type { XUserCredentials } from "./x-user-credentials";

/** Return the X credentials from `CC_X_API_KEY`, `CC_X_API_SECRET`, `CC_X_ACCESS_TOKEN` and `CC_X_ACCESS_TOKEN_SECRET`, or `undefined` when any is unset. */
export function getXUserCredentials(): XUserCredentials | undefined {
  const apiKey = process.env.CC_X_API_KEY;
  const apiSecret = process.env.CC_X_API_SECRET;
  const accessToken = process.env.CC_X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.CC_X_ACCESS_TOKEN_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return undefined;
  }
  return { apiKey, apiSecret, accessToken, accessTokenSecret };
}
