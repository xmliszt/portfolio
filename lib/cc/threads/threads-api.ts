import { CC_ORIGIN } from "@/lib/cc/cc-hosts";

export const THREADS_GRAPH_ORIGIN = "https://graph.threads.com";

export const THREADS_AUTHORIZE_URL = "https://threads.com/oauth/authorize";

export const THREADS_SCOPES = [
  "threads_basic",
  "threads_manage_insights",
  "threads_keyword_search",
  "threads_content_publish",
];

export const THREADS_REDIRECT_URI = `${CC_ORIGIN}/api/cc/threads/callback`;

export const THREADS_STATE_COOKIE = "cc_threads_state";
