import groupBy from "lodash/groupBy.js";
import keyBy from "lodash/keyBy.js";
import uniq from "lodash/uniq.js";

import { listActiveKeywords } from "@/lib/cc/data/list-active-keywords";
import { listKeywordCounts } from "@/lib/cc/data/list-keyword-counts";
import { listPostedTimes } from "@/lib/cc/data/list-posted-times";
import { formatSgt } from "@/lib/cc/format-sgt";
import { listUtcDays } from "@/lib/cc/list-utc-days";
import { summariseKeywordSeries } from "@/lib/cc/summarise-keyword-series";

import { KeywordsPanel } from "./keywords-panel";

const DAY_COUNT = 30;

export async function KeywordsSection() {
  if (!process.env.CC_X_BEARER_TOKEN) {
    return (
      <KeywordsPanel
        ready={false}
        dayLabels={[]}
        postedDayIndexes={[]}
        keywords={[]}
      />
    );
  }
  const days = listUtcDays({ now: new Date(), count: DAY_COUNT });
  const firstDay = days.at(0) ?? "";
  const keywords = await listActiveKeywords();
  const [counts, postedTimes] = await Promise.all([
    listKeywordCounts({
      keywordIds: keywords.map((keyword) => keyword.id),
      sinceDay: firstDay,
    }),
    listPostedTimes({ since: new Date(`${firstDay}T00:00:00Z`) }),
  ]);
  const countsByKeyword = groupBy(counts, (count) => count.keyword_id);
  const postedDays = uniq(
    postedTimes.map((postedAt) => postedAt.toISOString().slice(0, 10))
  );

  return (
    <KeywordsPanel
      ready
      dayLabels={days.map((day) =>
        formatSgt({ date: new Date(`${day}T12:00:00Z`), pattern: "EEE dd MMM" })
      )}
      postedDayIndexes={postedDays.flatMap((day) => {
        const index = days.indexOf(day);
        return index === -1 ? [] : [index];
      })}
      keywords={keywords.map((keyword) => {
        const byDay = keyBy(
          countsByKeyword[keyword.id] ?? [],
          (row) => row.day
        );
        const values = days.map((day) => byDay[day]?.count);
        const summary = summariseKeywordSeries(values);
        return {
          id: keyword.id,
          term: keyword.term,
          values,
          last7Total: summary.last7Total,
          change: summary.change,
        };
      })}
    />
  );
}
