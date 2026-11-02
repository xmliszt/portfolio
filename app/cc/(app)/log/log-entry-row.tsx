"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { logMetricEntry } from "@/app/cc/(app)/_actions/log-metric-entry";
import { formatCheckpoint } from "@/app/cc/(app)/log/format-checkpoint";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { getMetricLabel } from "@/lib/cc/get-metric-label";
import { listMetricLabels } from "@/lib/cc/list-metric-labels";
import { parseMetricLine } from "@/lib/cc/parse-metric-line";
import { type MetricField, PLATFORMS } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

import type { LogEntryRowData } from "./log-entry-types";

type LogEntryRowProps = {
  row: LogEntryRowData;
  onLogged: (result: {
    row: LogEntryRowData;
    metricId: number;
    summary: string;
    ratio: number | undefined;
  }) => void;
  onRemove?: () => void;
};

function parseField(options: { text: string; field: MetricField }) {
  const text = options.text.trim();
  if (text === "") return { kind: "empty" } as const;
  const parsed = parseMetricLine({ line: text, fields: [options.field] });
  switch (parsed.kind) {
    case "ok":
      return { kind: "number", value: parsed.values[options.field] } as const;
    case "undo":
      return { kind: "error", reason: `Can't read "${text}".` } as const;
    case "error":
      return { kind: "error", reason: parsed.reason } as const;
    default: {
      const unhandled: never = parsed;
      return unhandled;
    }
  }
}

export function LogEntryRow(props: LogEntryRowProps) {
  const platform = PLATFORMS[props.row.platformId];
  const [texts, setTexts] = useState<{ [field in MetricField]?: string }>({});
  const [pasteLine, setPasteLine] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSaving, startSaving] = useTransition();
  const idPrefix = `log-${props.row.key}`;

  function fillFromLine(line: string) {
    const parsed = parseMetricLine({ line, fields: platform.metrics });
    if (parsed.kind !== "ok") {
      setError(
        parsed.kind === "error" ? parsed.reason : "Use Undo below instead."
      );
      return;
    }
    setError(undefined);
    setTexts(
      Object.fromEntries(
        platform.metrics.map((field) => {
          const value = parsed.values[field];
          return [field, value === undefined ? "" : String(value)];
        })
      )
    );
  }

  function handlePasteKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    fillFromLine(pasteLine);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    fillFromLine(event.clipboardData.getData("text"));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = platform.metrics.map((field) => ({
      field,
      result: parseField({ text: texts[field] ?? "", field }),
    }));
    const failed = parsed.find((entry) => entry.result.kind === "error");
    if (failed !== undefined && failed.result.kind === "error") {
      setError(`${failed.field}: ${failed.result.reason}`);
      return;
    }
    const entries = parsed.flatMap((entry) =>
      entry.result.kind === "number" && entry.result.value !== undefined
        ? [{ field: entry.field, value: entry.result.value }]
        : []
    );
    if (entries.length === 0) {
      setError("Type at least one number.");
      return;
    }
    setError(undefined);
    startSaving(async () => {
      try {
        const saved = await logMetricEntry({
          postId: props.row.postId,
          checkpoint: props.row.checkpoint,
          values: Object.fromEntries(
            entries.map((entry) => [entry.field, entry.value])
          ),
        });
        setTexts({});
        setPasteLine("");
        props.onLogged({
          row: props.row,
          metricId: saved.metricId,
          summary: entries
            .map((entry) => `${entry.field} ${formatMetricNumber(entry.value)}`)
            .join(" · "),
          ratio: saved.ratio,
        });
      } catch {
        setError("Couldn't save. Try again.");
      }
    });
  }

  return (
    <div className="border-cc-line-soft flex flex-col gap-y-1.5 border-b px-3 py-2 last:border-b-0">
      <form
        onSubmit={handleSubmit}
        aria-label={`${platform.label} ${formatCheckpoint(props.row.checkpoint)}`}
        className="flex flex-wrap items-end gap-x-2 gap-y-2"
      >
        <div className="flex w-full min-w-0 flex-col gap-y-0.5 lg:w-[240px]">
          <div className="flex items-center gap-x-2">
            <PlatformChip platformId={props.row.platformId} />
            <span className="text-primary text-[11px] font-semibold">
              {formatCheckpoint(props.row.checkpoint)}
            </span>
          </div>
          <span className="text-cc-text-2 truncate" title={props.row.label}>
            {props.row.target !== undefined && (
              <span className="text-muted-foreground">{props.row.target} </span>
            )}
            {props.row.label}
          </span>
          {props.row.dueNote !== undefined && (
            <span className="text-cc-warn text-[11px]">
              {props.row.dueNote}
            </span>
          )}
        </div>
        {platform.metrics.map((field) => {
          const last = props.row.lastValues[field];
          return (
            <div key={field} className="flex w-[76px] flex-col gap-y-0.5">
              <label
                htmlFor={`${idPrefix}-${field}`}
                className="text-muted-foreground truncate text-[10px] tracking-[0.04em] uppercase"
              >
                {getMetricLabel({ platformId: props.row.platformId, field })}
              </label>
              <input
                id={`${idPrefix}-${field}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={last === undefined ? "" : formatMetricNumber(last)}
                value={texts[field] ?? ""}
                onChange={(event) =>
                  setTexts({ ...texts, [field]: event.target.value })
                }
                className="cc-input font-semibold tabular-nums"
              />
            </div>
          );
        })}
        <div className="flex gap-x-2">
          <CcButton type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "SAVING…" : "SAVE"}
          </CcButton>
          {props.onRemove !== undefined && (
            <CcButton
              type="button"
              onClick={props.onRemove}
              disabled={isSaving}
              aria-label="Remove this extra row"
            >
              ✕
            </CcButton>
          )}
        </div>
      </form>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 lg:pl-[248px]">
        <label
          htmlFor={`${idPrefix}-paste`}
          className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
        >
          OR PASTE A LINE
        </label>
        <input
          id={`${idPrefix}-paste`}
          type="text"
          autoComplete="off"
          placeholder={listMetricLabels({
            platformId: props.row.platformId,
          }).join(" · ")}
          value={pasteLine}
          onChange={(event) => setPasteLine(event.target.value)}
          onKeyDown={handlePasteKeyDown}
          onPaste={handlePaste}
          className="cc-input min-w-0 flex-[1_1_240px]"
        />
        <span
          role={error === undefined ? undefined : "alert"}
          className={cn(
            "text-[11px]",
            error === undefined ? "text-muted-foreground" : "text-cc-warn"
          )}
        >
          {error ?? "Enter fills the boxes above, in this order."}
        </span>
      </div>
    </div>
  );
}
