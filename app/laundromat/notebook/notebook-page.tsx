"use client";

import type { PageRow } from "@/lib/laundromat/notebook/layout-page-rows";
import type { NotebookPage as NotebookPageSettings } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";
import { cn } from "@/lib/utils";

import { InkedLine } from "./inked-line";

export type PageContent =
  | { kind: "cover"; number: number }
  | { kind: "inside"; number: number; span: string }
  | { kind: "paper"; page: number }
  | { kind: "blank" };

export type RowView = PageRow & {
  script: NotebookScript;
  fontFamily: string;
  fontSizePx: number;
  isRtl: boolean;
  ink: "plain" | "inking" | "waiting";
  hasCaret: boolean;
  reportEntryId: number | undefined;
};

type PageControls = {
  onNumber: (() => void) | undefined;
  onCorner: (() => void) | undefined;
  onReport: (entryId: number) => void;
  reportedIds: number[];
  onInkComplete: (entryId: string) => void;
  inkSpeed: number;
};

type NotebookPageProps = {
  content: PageContent;
  side: "left" | "right";
  settings: NotebookPageSettings;
  pitch: number;
  rows: RowView[];
  controls: PageControls | undefined;
};

export function NotebookPage(props: NotebookPageProps) {
  const { settings, content, pitch } = props;
  const shading =
    props.side === "left"
      ? "inset -18px 0 24px -20px rgb(0 0 0 / 0.35)"
      : "inset 18px 0 24px -20px rgb(0 0 0 / 0.35)";

  if (content.kind === "cover") {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-y-3",
          "rounded-[4px_14px_14px_4px] border border-[var(--lm-line)] bg-[var(--lm-face-top)]",
          "shadow-[0_1px_2px_rgb(0_0_0/0.3),0_18px_40px_rgb(0_0_0/0.35)]"
        )}
      >
        <span className="h-px w-36 bg-[var(--lm-line)]" />
        <span className="font-[family-name:var(--lm-font-display)] text-[28px] text-[var(--lm-ink)]">
          {`No. ${content.number}`}
        </span>
        <span className="h-px w-36 bg-[var(--lm-line)]" />
      </div>
    );
  }

  if (content.kind === "inside") {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-[var(--lm-paper-rule)] text-[var(--lm-ink-pen)]"
        style={{ boxShadow: shading }}
      >
        <span className="font-[family-name:var(--lm-font-display)] text-[22px] opacity-60">
          {`No. ${content.number}`}
        </span>
        <span className="text-[11px] opacity-50">{content.span}</span>
      </div>
    );
  }

  const ruleCount = Math.round(
    (settings.height - settings.marginTop - settings.marginBottom) / pitch
  );

  return (
    <div
      className="absolute inset-0 bg-[var(--lm-paper)]"
      style={{ boxShadow: shading }}
    >
      {Array.from({ length: ruleCount }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className="absolute inset-x-0 h-px bg-[var(--lm-paper-rule)]"
          style={{ top: settings.marginTop + (index + 1) * pitch - 1 }}
        />
      ))}
      {props.rows.map((row) => (
        <PageRowLine
          key={row.key}
          row={row}
          settings={settings}
          pitch={pitch}
          controls={props.controls}
        />
      ))}
      {content.kind === "paper" && (
        <button
          type="button"
          tabIndex={props.controls?.onNumber === undefined ? -1 : 0}
          aria-label={`Page ${content.page}, go to another page`}
          disabled={props.controls?.onNumber === undefined}
          onClick={props.controls?.onNumber}
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-2",
            "font-[family-name:var(--lm-font-display)] text-[13px] text-[var(--lm-ink-pen)]/50 outline-none",
            "underline-offset-4 enabled:cursor-pointer enabled:hover:underline focus-visible:outline-1 focus-visible:outline-dashed"
          )}
        >
          {content.page}
        </button>
      )}
      {props.controls?.onCorner !== undefined && (
        <button
          type="button"
          aria-label={props.side === "left" ? "Previous page" : "Next page"}
          onClick={props.controls.onCorner}
          className={cn(
            "group absolute bottom-0 size-16 cursor-pointer outline-none",
            props.side === "left" ? "left-0" : "right-0"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute bottom-0 size-0 transition-[width,height] duration-200 ease-out",
              "group-hover:size-8 group-focus-visible:size-8",
              props.side === "left"
                ? "left-0 bg-[linear-gradient(225deg,var(--lm-paper-rule)_50%,var(--lm-bg)_50%)]"
                : "right-0 bg-[linear-gradient(135deg,var(--lm-paper-rule)_50%,var(--lm-bg)_50%)]"
            )}
          />
        </button>
      )}
    </div>
  );
}

type PageRowLineProps = {
  row: RowView;
  settings: NotebookPageSettings;
  pitch: number;
  controls: PageControls | undefined;
};

function PageRowLine(props: PageRowLineProps) {
  const { row, settings, pitch } = props;
  const top =
    settings.marginTop +
    row.row * pitch +
    (row.kind === "text" ? pitch * settings.textDropRatio : 0);
  const box = {
    top,
    left: settings.marginX,
    right: settings.marginX,
    height: pitch,
    lineHeight: `${pitch}px`,
  };

  if (row.kind === "meta") {
    const reportEntryId = row.reportEntryId;
    const isReported =
      reportEntryId !== undefined &&
      (props.controls?.reportedIds.includes(reportEntryId) ?? false);
    return (
      <div
        className={cn(
          "group absolute flex items-center text-[11px] text-[var(--lm-ink-pen)] transition-opacity duration-300",
          row.isRtl && "flex-row-reverse"
        )}
        style={{ ...box, opacity: row.ink === "plain" ? 0.45 : 0 }}
      >
        <span className="truncate">{row.text}</span>
        {reportEntryId !== undefined && props.controls !== undefined && (
          <button
            type="button"
            disabled={isReported}
            onClick={() => props.controls?.onReport(reportEntryId)}
            className={cn(
              "absolute -right-12 cursor-pointer px-1.5 py-1 opacity-0 outline-none transition-opacity duration-200",
              "group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-dashed",
              isReported && "opacity-100"
            )}
          >
            {isReported ? "reported" : "report"}
          </button>
        )}
      </div>
    );
  }

  const textClassName = "whitespace-pre text-[var(--lm-ink-pen)]";
  const textStyle = {
    fontFamily: row.fontFamily,
    fontSize: row.fontSizePx,
  };
  return (
    <div
      dir={row.isRtl ? "rtl" : "ltr"}
      className="absolute overflow-visible"
      style={{ ...box, ...textStyle }}
    >
      {row.ink === "inking" && props.controls !== undefined ? (
        <InkedLine
          text={row.text}
          script={row.script}
          fontFamily={row.fontFamily}
          speed={props.controls.inkSpeed}
          className={textClassName}
          onComplete={() => props.controls?.onInkComplete(row.entryId)}
        />
      ) : (
        <span
          className={textClassName}
          style={{ opacity: row.ink === "waiting" ? 0 : 1 }}
        >
          {row.text}
        </span>
      )}
      {row.hasCaret && (
        <span
          aria-hidden
          className="ml-px inline-block h-[0.8em] w-[1.5px] translate-y-[0.12em] bg-[var(--lm-accent)] motion-safe:animate-[lm-caret_1.1s_steps(1)_infinite]"
        />
      )}
    </div>
  );
}
