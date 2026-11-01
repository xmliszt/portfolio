"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { checkXTags } from "@/app/cc/(app)/_actions/check-x-tags";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";

type XTagCheckPanelProps = {
  hashtags: readonly string[];
  className?: string;
};

type XTagCheck = Awaited<ReturnType<typeof checkXTags>>;

export function XTagCheckPanel(props: XTagCheckPanelProps) {
  const [typed, setTyped] = useState("");
  const [check, setCheck] = useState<XTagCheck | undefined>(undefined);
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
        setCheck(await checkXTags({ terms }));
        setError(undefined);
      } catch {
        setError("Couldn't reach X. Try again.");
      }
    });
  }

  return (
    <Panel
      title="Check tags on X"
      aside="Posts in the last 7 days · $0.005 a term"
      className={props.className}
      bodyClassName="flex flex-col gap-y-3 px-[18px] py-4"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-x-3 gap-y-2"
      >
        <div className="flex min-w-[180px] flex-1 flex-col gap-y-1.5">
          <label
            htmlFor="x-check-tags-term"
            className="text-muted-foreground text-[11px] tracking-[0.14em]"
          >
            TERM · BLANK CHECKS THIS POST&apos;S HASHTAGS
          </label>
          <input
            id="x-check-tags-term"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={
              props.hashtags.length === 0
                ? "#indiedev or a phrase"
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
                  X is not set up: add CC_X_BEARER_TOKEN in Vercel.
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
                          ? `X refused (${result.status})`
                          : `${formatMetricNumber(result.total)} posts`}
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
    </Panel>
  );
}
