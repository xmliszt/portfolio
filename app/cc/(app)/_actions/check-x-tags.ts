"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { fetchXPostCounts } from "@/lib/cc/x/fetch-x-post-counts";

const MAX_TERMS = 5;
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const END_MARGIN_MS = 60 * 1000;

type XTagResult =
  | { kind: "failed"; term: string; status: number }
  | { kind: "found"; term: string; total: number };

type XTagCheck =
  | { kind: "not-set-up" }
  | { kind: "checked"; results: XTagResult[] };

/** Count X posts (reposts left out) with each of `terms` over the last 7 days, at most 5 terms, one paid counts request each. */
export async function checkXTags(options: {
  terms: string[];
}): Promise<XTagCheck> {
  await requireCcOwner();
  const bearerToken = process.env.CC_X_BEARER_TOKEN;
  if (!bearerToken) return { kind: "not-set-up" };
  const endTime = new Date(Date.now() - END_MARGIN_MS);
  const startTime = new Date(endTime.getTime() - WINDOW_MS + END_MARGIN_MS);
  const terms = [
    ...new Set(
      options.terms.map((term) => term.trim()).filter((term) => term !== "")
    ),
  ].slice(0, MAX_TERMS);
  const results = await Promise.all(
    terms.map(async (term): Promise<XTagResult> => {
      const counts = await fetchXPostCounts({
        bearerToken,
        term,
        startTime,
        endTime,
      });
      if (counts.kind === "error") {
        return { kind: "failed", term, status: counts.status };
      }
      const total = (counts.response.data ?? []).reduce(
        (sum, bucket) => sum + (bucket.post_count ?? bucket.tweet_count ?? 0),
        0
      );
      return { kind: "found", term, total };
    })
  );
  return { kind: "checked", results };
}
