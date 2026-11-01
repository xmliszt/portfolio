import {
  THREADS_AUTHORIZE_URL,
  THREADS_REDIRECT_URI,
  THREADS_SCOPES,
} from "./threads-api";

/** Return the Threads authorization window URL for app `appId`, carrying `state`. */
export function buildThreadsAuthorizeUrl(options: {
  appId: string;
  state: string;
}) {
  const url = new URL(THREADS_AUTHORIZE_URL);
  url.searchParams.set("client_id", options.appId);
  url.searchParams.set("redirect_uri", THREADS_REDIRECT_URI);
  url.searchParams.set("scope", THREADS_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", options.state);
  return url;
}
