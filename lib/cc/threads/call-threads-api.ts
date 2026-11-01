import "server-only";

import type {
  ThreadsApiErrorReason,
  ThreadsApiResult,
} from "./threads-api-result";

type GraphError = {
  error?: { message?: string; code?: number; error_subcode?: number };
};

const RATE_LIMIT_CODES = [4, 17, 32, 613];

function toReason(options: {
  status: number;
  code: number | undefined;
}): ThreadsApiErrorReason {
  const code = options.code;
  if (code === 190 || options.status === 401) return "token";
  if (code === 10 || (code !== undefined && code >= 200 && code <= 299)) {
    return "permission";
  }
  if (
    options.status === 429 ||
    (code !== undefined && RATE_LIMIT_CODES.includes(code))
  ) {
    return "rate-limit";
  }
  return "other";
}

/** Send `init` to the Threads Graph API at `url` and return the parsed JSON body, or the error with Graph's code mapped to a reason; never throws for an HTTP or network error. */
export async function callThreadsApi<T>(options: {
  url: URL;
  init?: RequestInit;
}): Promise<ThreadsApiResult<T>> {
  try {
    const response = await fetch(options.url, {
      ...options.init,
      cache: "no-store",
    });
    if (response.ok) {
      const data: T = await response.json();
      return { kind: "ok", data };
    }
    const body: GraphError = await response.json().catch(() => ({}));
    return {
      kind: "error",
      reason: toReason({ status: response.status, code: body.error?.code }),
      status: response.status,
      message: body.error?.message ?? response.statusText,
    };
  } catch (error) {
    return {
      kind: "error",
      reason: "other",
      status: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
