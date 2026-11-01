import "server-only";

import { buildXCountsQuery } from "@/lib/cc/build-x-counts-query";

import type { XCountsResponse } from "./x-counts-response";

type XCountsResult =
  | { kind: "ok"; response: XCountsResponse }
  | { kind: "error"; status: number; message: string };

/** Return X's daily counts of posts with `term` (reposts left out) from `startTime` to `endTime`, or the HTTP status and message when X refuses; never throws. */
export async function fetchXPostCounts(options: {
  bearerToken: string;
  term: string;
  startTime: Date;
  endTime: Date;
}): Promise<XCountsResult> {
  const url = new URL("https://api.x.com/2/tweets/counts/recent");
  url.searchParams.set("query", buildXCountsQuery(options.term));
  url.searchParams.set("granularity", "day");
  url.searchParams.set("start_time", options.startTime.toISOString());
  url.searchParams.set("end_time", options.endTime.toISOString());
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${options.bearerToken}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        kind: "error",
        status: response.status,
        message: (await response.text()).slice(0, 300),
      };
    }
    const body: XCountsResponse = await response.json();
    return { kind: "ok", response: body };
  } catch (error) {
    return {
      kind: "error",
      status: 0,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
