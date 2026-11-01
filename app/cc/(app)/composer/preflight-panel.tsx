"use client";

import { useState } from "react";

import { Panel } from "@/app/cc/_ui/panel";
import { cn } from "@/lib/utils";

import type { PreflightCheck } from "./preflight-check";

type PreflightPanelProps = {
  platformLabel: string;
  checks: readonly PreflightCheck[];
  className?: string;
};

export function PreflightPanel(props: PreflightPanelProps) {
  const [tickedIds, setTickedIds] = useState<readonly string[]>([]);
  const computed = props.checks.flatMap((check) =>
    check.kind === "computed" ? [check] : []
  );
  const passedCount = computed.filter((check) => check.passed).length;
  const manual = props.checks.flatMap((check) =>
    check.kind === "manual" ? [check] : []
  );

  function toggle(id: string) {
    setTickedIds(
      tickedIds.includes(id)
        ? tickedIds.filter((tickedId) => tickedId !== id)
        : [...tickedIds, id]
    );
  }

  return (
    <Panel
      title={`Pre-flight · ${props.platformLabel}`}
      className={props.className}
      aside={
        <span
          className={cn(
            "text-[13px] font-bold tabular-nums",
            passedCount === computed.length ? "text-cc-ok" : "text-cc-warn"
          )}
        >
          {passedCount}/{computed.length}
        </span>
      }
    >
      <ul>
        {computed.map((check) => (
          <li
            key={check.id}
            className="border-cc-line-soft grid grid-cols-[22px_minmax(0,1fr)] gap-x-2.5 border-b px-[18px] py-2.5"
          >
            <span
              aria-label={check.passed ? "Passed" : "Needs a look"}
              className={cn(
                "font-bold",
                check.passed ? "text-cc-ok" : "text-cc-warn"
              )}
            >
              {check.passed ? "✓" : "!"}
            </span>
            <div className="flex flex-col gap-y-0.5">
              <span>{check.label}</span>
              <span className="text-muted-foreground text-[11px] leading-normal">
                {check.why}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {manual.length > 0 && (
        <div className="flex flex-col">
          <div className="text-muted-foreground px-[18px] pt-3 pb-1 text-[11px] tracking-[0.14em]">
            CHECK BY HAND · NOT SAVED
          </div>
          <ul>
            {manual.map((check) => {
              const isTicked = tickedIds.includes(check.id);
              return (
                <li key={check.id} className="border-cc-line-soft border-b">
                  <label className="grid min-h-11 cursor-pointer grid-cols-[22px_minmax(0,1fr)] gap-x-2.5 px-[18px] py-2.5">
                    <input
                      type="checkbox"
                      checked={isTicked}
                      onChange={() => toggle(check.id)}
                      className="accent-primary mt-0.5 size-4"
                    />
                    <span className="flex flex-col gap-y-0.5">
                      <span className={cn(isTicked && "text-cc-ok")}>
                        {check.label}
                      </span>
                      <span className="text-muted-foreground text-[11px] leading-normal">
                        {check.why}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}
