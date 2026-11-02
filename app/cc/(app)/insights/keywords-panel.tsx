"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { addKeyword } from "@/app/cc/(app)/_actions/add-keyword";
import { archiveKeyword } from "@/app/cc/(app)/_actions/archive-keyword";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";

import { KeywordSparkline } from "./keyword-sparkline";

type KeywordsPanelProps = {
  ready: boolean;
  dayLabels: string[];
  postedDayIndexes: number[];
  keywords: {
    id: string;
    term: string;
    values: (number | undefined)[];
    last7Total: number | undefined;
    change: number | undefined;
  }[];
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

export function KeywordsPanel(props: KeywordsPanelProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim() === "") return;
    startTransition(async () => {
      try {
        const result = await addKeyword({ term: draft });
        if (result.kind === "rejected") {
          setError(result.reason);
          return;
        }
        setDraft("");
        setError(undefined);
      } catch {
        setError("Couldn't add the keyword. Try again.");
      }
    });
  }

  function handleArchive(keywordId: string) {
    startTransition(async () => {
      try {
        await archiveKeyword({ keywordId });
        setError(undefined);
      } catch {
        setError("Couldn't archive the keyword. Try again.");
      }
    });
  }

  if (!props.ready) {
    return (
      <Panel
        title="Keywords · X posts per day"
        className="flex-[1_1_100%]"
        bodyClassName="flex flex-col gap-y-2 px-3 py-2.5"
      >
        <p className="text-cc-text-2 text-[11px] leading-relaxed">
          X keyword tracking is not set up.
        </p>
        <ol className="text-muted-foreground flex list-decimal flex-col gap-y-1 pl-5 text-[12px] leading-relaxed">
          <li>
            Create an app in the X developer console with pay-per-use credits
            and copy its Bearer token.
          </li>
          <li>
            Set <code>CC_X_BEARER_TOKEN</code> in Vercel and redeploy.
          </li>
          <li>
            Counts arrive from the daily 10:10 SGT job, one request per keyword.
          </li>
        </ol>
      </Panel>
    );
  }

  return (
    <Panel
      title="Keywords · X posts per day"
      aside="Last 30 UTC days · each line on its own scale · ticks mark days you posted"
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      {props.keywords.length === 0 ? (
        <p className="text-cc-text-2 text-[11px] leading-relaxed">
          No keywords yet. Add a term, like your product name or a hashtag, and
          the daily job starts counting X posts that use it.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-3 gap-y-3">
          {props.keywords.map((keyword) => (
            <li key={keyword.id} className="flex flex-col gap-y-1.5">
              <div className="flex items-start justify-between gap-x-2">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-bold">{keyword.term}</span>
                  <span className="text-muted-foreground text-[11px] tabular-nums">
                    {keyword.last7Total === undefined
                      ? "No counts yet"
                      : `${formatMetricNumber(keyword.last7Total)} in 7 days`}
                    {keyword.change !== undefined &&
                      ` · ${percentFormatter.format(keyword.change)} vs prior 7`}
                  </span>
                </div>
                <CcButton
                  size="sm"
                  onClick={() => handleArchive(keyword.id)}
                  disabled={isPending}
                  aria-label={`Archive ${keyword.term}`}
                >
                  ✕
                </CcButton>
              </div>
              <KeywordSparkline
                term={keyword.term}
                values={keyword.values}
                dayLabels={props.dayLabels}
                postedDayIndexes={props.postedDayIndexes}
              />
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-x-3 gap-y-2"
      >
        <div className="flex min-w-[220px] flex-1 flex-col gap-y-1.5">
          <label
            htmlFor="keyword-term"
            className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
          >
            NEW KEYWORD
          </label>
          <input
            id="keyword-term"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="laundro.cafe or #buildinpublic"
            className="cc-input"
          />
        </div>
        <CcButton
          type="submit"
          variant="ok"
          disabled={isPending || draft.trim() === ""}
        >
          + TRACK
        </CcButton>
        {error !== undefined && (
          <span role="alert" className="text-cc-warn text-[11px]">
            {error}
          </span>
        )}
      </form>
    </Panel>
  );
}
