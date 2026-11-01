import "server-only";

import { listUtcDays } from "@/lib/cc/list-utc-days";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toKeywordCountRows } from "@/lib/cc/to-keyword-count-rows";

import { fetchXPostCounts } from "./fetch-x-post-counts";

export const MAX_ACTIVE_KEYWORDS = 30;

/** Fetch X's daily post counts for the 6 full UTC days before `now` for every active keyword (at most 30), upsert them into `keyword_counts`, and return which keywords were saved and which were skipped. */
export async function runKeywordCounts(options: {
  bearerToken: string;
  now: Date;
}) {
  const supabase = createCcServiceClient();
  const { data: keywords, error } = await supabase
    .from("keywords")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(MAX_ACTIVE_KEYWORDS);
  if (error) throw error;

  const days = listUtcDays({ now: options.now, count: 6 });
  const startTime = new Date(`${days.at(0)}T00:00:00Z`);
  const endTime = new Date(`${days.at(-1)}T00:00:00Z`);
  endTime.setUTCDate(endTime.getUTCDate() + 1);

  const results = await Promise.all(
    keywords.map(async (keyword) => {
      const counts = await fetchXPostCounts({
        bearerToken: options.bearerToken,
        term: keyword.term,
        startTime,
        endTime,
      });
      if (counts.kind === "error") {
        console.warn(
          `[cc/keywords] X refused "${keyword.term}" (${counts.status}): ${counts.message}`
        );
        return { term: keyword.term, saved: false, status: counts.status };
      }
      const rows = toKeywordCountRows({
        keywordId: keyword.id,
        response: counts.response,
        fetchedAt: options.now,
      });
      const { error: upsertError } = await supabase
        .from("keyword_counts")
        .upsert(rows, { onConflict: "keyword_id,day,source" });
      if (upsertError) {
        console.warn(
          `[cc/keywords] could not save "${keyword.term}": ${upsertError.message}`
        );
        return { term: keyword.term, saved: false, status: undefined };
      }
      return { term: keyword.term, saved: true, status: 200 };
    })
  );
  return {
    saved: results
      .filter((result) => result.saved)
      .map((result) => result.term),
    skipped: results.filter((result) => !result.saved),
  };
}
