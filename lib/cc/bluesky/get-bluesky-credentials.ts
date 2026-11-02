import "server-only";

/** Return the Bluesky handle and app password from `CC_BLUESKY_HANDLE` and `CC_BLUESKY_APP_PASSWORD`, or `undefined` when either is unset. */
export function getBlueskyCredentials() {
  const handle = process.env.CC_BLUESKY_HANDLE;
  const appPassword = process.env.CC_BLUESKY_APP_PASSWORD;
  if (!handle || !appPassword) return undefined;
  return { handle, appPassword };
}
