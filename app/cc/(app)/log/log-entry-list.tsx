"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcSelect } from "@/app/cc/_ui/cc-select";
import { undoMetricEntry } from "@/app/cc/(app)/_actions/undo-metric-entry";
import { PLATFORMS } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

import { formatCheckpoint } from "./format-checkpoint";
import { LogEntryRow } from "./log-entry-row";
import type { LogEntryPost, LogEntryRowData } from "./log-entry-types";

type LogEntryListProps = {
  dueRows: LogEntryRowData[];
  postedPosts: LogEntryPost[];
  emptyNote: React.ReactNode;
};

type Status =
  | { kind: "idle" }
  | { kind: "logged"; text: string; metricId: number }
  | { kind: "undone"; text: string }
  | { kind: "error"; text: string };

export function LogEntryList(props: LogEntryListProps) {
  const [extraRows, setExtraRows] = useState<LogEntryRowData[]>([]);
  const [extraPostId, setExtraPostId] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isUndoing, startUndo] = useTransition();

  function handleLogged(result: {
    row: LogEntryRowData;
    metricId: number;
    summary: string;
    ratio: number | undefined;
  }) {
    const platformLabel = PLATFORMS[result.row.platformId].label;
    const comparison =
      result.ratio === undefined
        ? ""
        : ` · ${result.ratio.toFixed(1)}× your ${platformLabel} median`;
    handleRemoveExtra(result.row.key);
    setStatus({
      kind: "logged",
      metricId: result.metricId,
      text: `Logged ✓ ${platformLabel} · ${result.summary}${comparison}`,
    });
  }

  function handleAddExtra(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const post = props.postedPosts.find(
      (posted) => posted.postId === extraPostId
    );
    if (post === undefined) return;
    setExtraRows((rows) => [
      ...rows,
      {
        ...post,
        key: `extra-${post.postId}-${Date.now()}`,
        checkpoint: "extra",
        dueNote: undefined,
      },
    ]);
    setExtraPostId("");
  }

  function handleRemoveExtra(key: string) {
    setExtraRows((current) => current.filter((extra) => extra.key !== key));
  }

  function handleUndo() {
    if (status.kind !== "logged") return;
    const savedId = status.metricId;
    startUndo(async () => {
      try {
        const removed = await undoMetricEntry();
        setStatus(
          removed === undefined
            ? { kind: "undone", text: "Nothing to undo." }
            : {
                kind: "undone",
                text:
                  removed.metricId === savedId
                    ? `Undone: removed the ${formatCheckpoint(removed.checkpoint)} entry.`
                    : `Undone: removed a newer ${formatCheckpoint(removed.checkpoint)} entry (logged elsewhere, likely Telegram).`,
              }
        );
      } catch {
        setStatus({ kind: "error", text: "Couldn't undo. Try again." });
      }
    });
  }

  const rows = [...props.dueRows, ...extraRows];

  return (
    <div className="flex flex-col">
      {status.kind !== "idle" && (
        <div
          role="status"
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-3",
            status.kind === "logged" && "text-cc-ok bg-cc-ok/5",
            status.kind === "undone" && "text-cc-text-2",
            status.kind === "error" && "text-cc-warn"
          )}
        >
          <span>{status.text}</span>
          {status.kind === "logged" && (
            <CcButton
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={isUndoing}
            >
              {isUndoing ? "UNDOING…" : "UNDO"}
            </CcButton>
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <div className="text-cc-text-2 px-3 py-6 leading-relaxed">
          {props.emptyNote}
        </div>
      ) : (
        rows.map((row) => (
          <LogEntryRow
            key={row.key}
            row={row}
            onLogged={handleLogged}
            onRemove={
              row.checkpoint === "extra"
                ? () => handleRemoveExtra(row.key)
                : undefined
            }
          />
        ))
      )}
      <form
        onSubmit={handleAddExtra}
        className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t px-3 py-3"
      >
        <label
          htmlFor="log-extra-post"
          className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
        >
          EXTRA ENTRY FOR
        </label>
        {props.postedPosts.length === 0 ? (
          <span className="text-muted-foreground text-[11px]">
            any posted post, once one is marked posted.
          </span>
        ) : (
          <>
            <CcSelect
              id="log-extra-post"
              className="flex-[1_1_240px]"
              value={extraPostId}
              onChange={setExtraPostId}
              placeholder="Pick a posted post…"
              options={props.postedPosts.map((post) => ({
                value: post.postId,
                label: `${PLATFORMS[post.platformId].label} · ${post.label}`,
              }))}
            />
            <CcButton type="submit" disabled={extraPostId === ""}>
              + ADD ROW
            </CcButton>
          </>
        )}
      </form>
    </div>
  );
}
