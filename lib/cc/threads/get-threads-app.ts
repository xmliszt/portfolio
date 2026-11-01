import "server-only";

/** Return the Threads app id and secret from `CC_THREADS_APP_ID` and `CC_THREADS_APP_SECRET`, or `undefined` when either is unset. */
export function getThreadsApp() {
  const appId = process.env.CC_THREADS_APP_ID;
  const appSecret = process.env.CC_THREADS_APP_SECRET;
  if (!appId || !appSecret) return undefined;
  return { appId, appSecret };
}
