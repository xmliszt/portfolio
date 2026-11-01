"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { checkThreadsTags } from "@/app/cc/(app)/_actions/check-threads-tags";
import { formatSgt } from "@/lib/cc/format-sgt";

type CheckTagsPanelProps = {
  hashtags: readonly string[];
  className?: string;
};

type TagCheck = Awaited<ReturnType<typeof checkThreadsTags>>;

const BLOCKED_REASONS = {
  token:
    "The Threads token expired or was revoked. Reconnect Threads on the Overview.",
  permission:
    "The Threads app lacks threads_keyword_search, so search can't run. Add the permission and reconnect.",
  "rate-limit": "Threads search hit its rate limit. Try again later.",
} as const;

export function CheckTagsPanel(props: CheckTagsPanelProps) {
  const [typed, setTyped] = useState("");
  const [check, setCheck] = useState<TagCheck | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const typedTerm = typed.trim();
  const terms =
    typedTerm === "" ? props.hashtags.map((tag) => `#${tag}`) : [typedTerm];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (terms.length === 0) return;
    startTransition(async () => {
      try {
        setCheck(await checkThreadsTags({ terms }));
        setError(undefined);
      } catch {
        setError("Couldn't run the search. Try again.");
      }
    });
  }

  return (
    <Panel
      title="Check tags"
      aside="Recent Threads posts · up to 25"
      className={props.className}
      bodyClassName="flex flex-col gap-y-3 px-[18px] py-4"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-x-3 gap-y-2"
      >
        <div className="flex min-w-[180px] flex-1 flex-col gap-y-1.5">
          <label
            htmlFor="check-tags-term"
            className="text-muted-foreground text-[11px] tracking-[0.14em]"
          >
            TERM · BLANK CHECKS THIS POST&apos;S HASHTAGS
          </label>
          <input
            id="check-tags-term"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={
              props.hashtags.length === 0
                ? "#cozygames"
                : props.hashtags.map((tag) => `#${tag}`).join(" ")
            }
            className="cc-input"
          />
        </div>
        <CcButton type="submit" disabled={isPending || terms.length === 0}>
          {isPending ? "CHECKING…" : "CHECK"}
        </CcButton>
      </form>
      {error !== undefined && (
        <p role="alert" className="text-cc-warn text-[12px]">
          {error}
        </p>
      )}
      {check !== undefined &&
        (() => {
          switch (check.kind) {
            case "not-set-up":
              return (
                <p className="text-muted-foreground text-[12px]">
                  Threads is not set up. See Integrations on the Overview.
                </p>
              );
            case "not-connected":
              return (
                <p className="text-muted-foreground text-[12px]">
                  Threads is not connected. Connect it under Integrations on the
                  Overview.
                </p>
              );
            case "blocked":
              return (
                <p className="text-cc-warn text-[12px]">
                  {BLOCKED_REASONS[check.reason]}
                </p>
              );
            case "checked":
              return (
                <ul className="flex flex-col">
                  {check.results.map((result) => (
                    <li
                      key={result.term}
                      className="flex justify-between gap-x-3 border-b border-dashed py-1.5 text-[12px]"
                    >
                      <span className="truncate">{result.term}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {result.kind === "failed"
                          ? "search failed"
                          : result.count === 0
                            ? "no recent posts"
                            : `${result.count}${result.isCapped ? "+" : ""} posts · newest ${
                                result.newestAt === undefined
                                  ? "unknown"
                                  : formatSgt({
                                      date: new Date(result.newestAt),
                                      pattern: "EEE dd MMM HH:mm",
                                    })
                              }`}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            default: {
              const unhandled: never = check;
              return unhandled;
            }
          }
        })()}
      <p className="text-muted-foreground text-[11px] leading-normal">
        Without the threads_keyword_search approval, Threads only searches your
        own posts.
      </p>
    </Panel>
  );
}
