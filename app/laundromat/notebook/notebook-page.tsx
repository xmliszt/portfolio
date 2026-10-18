"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import type { PageRow } from "@/lib/laundromat/notebook/layout-page-rows";
import type {
  NotebookPage as NotebookPageSettings,
  SceneConfig,
} from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";
import { cn } from "@/lib/utils";

import { DoodleInk } from "./doodle-ink";
import { DoodlePad } from "./doodle-pad";
import { getPageRadius } from "./get-page-radius";
import { InkedLine } from "./inked-line";
import { NOTEBOOK_PAGE_METRICS } from "./notebook-page-metrics";

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
  selected: { from: number; to: number } | undefined;
  caretAt: number | undefined;
  markTone: "own" | "remote";
  reportEntryId: number | undefined;
};

export type DoodleView = {
  entryId: string;
  row: number;
  rowCount: number;
  strokes: DoodleStroke[];
  ink: RowView["ink"];
};

export type PadView = {
  row: number;
  rowCount: number;
  strokes: DoodleStroke[];
  tone: "own" | "remote";
};

export type RemoteCaret = {
  left: number;
  top: number;
  fontFamily: string;
  fontSizePx: number;
};

type PageControls = {
  onNumber: (() => void) | undefined;
  edge:
    | {
        onClick: () => void;
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
      }
    | undefined;
  onReport: (entryId: number) => void;
  reportedIds: number[];
  onInkComplete: (entryId: string) => void;
  inkSpeed: number;
  pad: PadControls | undefined;
};

type PadControls = {
  disabled: boolean;
  onStrokeStart: () => void;
  onStroke: (stroke: DoodleStroke) => void;
  onUndo: () => void;
  onClear: () => void;
};

type NotebookPageProps = {
  content: PageContent;
  side: "left" | "right";
  settings: NotebookPageSettings;
  pitch: number;
  rows: RowView[];
  doodles: DoodleView[];
  pad: PadView | undefined;
  doodle: SceneConfig["notebook"]["doodle"];
  remoteCaret: RemoteCaret | undefined;
  controls: PageControls | undefined;
};

export function NotebookPage(props: NotebookPageProps) {
  const { copy } = useLaundromatCopy();
  const { settings, content, pitch } = props;
  const [hoveredEntryId, setHoveredEntryId] = useState<string>();
  const { spineShadow } = NOTEBOOK_PAGE_METRICS;
  const borderRadius = getPageRadius(props.side);
  const shading = `inset ${props.side === "left" ? -spineShadow.offsetPx : spineShadow.offsetPx}px 0 ${spineShadow.blurPx}px ${spineShadow.spreadPx}px rgb(0 0 0 / ${spineShadow.alpha})`;

  if (content.kind === "cover") {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-y-3",
          "border border-[var(--lm-line)] bg-[var(--lm-face-top)]",
          "shadow-[0_1px_2px_rgb(0_0_0/0.3),0_18px_40px_rgb(0_0_0/0.35)]"
        )}
        style={{ borderRadius }}
      >
        <span className="h-px w-36 bg-[var(--lm-line)]" />
        <span className="font-[family-name:var(--lm-font-display)] text-[28px] text-[var(--lm-ink)]">
          {copy.notebook.number({ number: content.number })}
        </span>
        <span className="h-px w-36 bg-[var(--lm-line)]" />
      </div>
    );
  }

  if (content.kind === "inside") {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-[var(--lm-paper-rule)] text-[var(--lm-ink-pen)]"
        style={{ borderRadius, boxShadow: shading }}
      >
        <span className="font-[family-name:var(--lm-font-display)] text-[22px] opacity-60">
          {copy.notebook.number({ number: content.number })}
        </span>
        <span className="text-[11px] opacity-50">{content.span}</span>
      </div>
    );
  }

  const ruleCount = Math.round(
    (settings.height - settings.marginTop - settings.marginBottom) / pitch
  );
  const { pad } = props;
  const textWidthPx = settings.width - settings.marginX * 2;

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[var(--lm-paper)]"
      style={{ borderRadius, boxShadow: shading }}
    >
      {Array.from({ length: ruleCount }, (_, index) =>
        pad !== undefined &&
        index >= pad.row &&
        index < pad.row + pad.rowCount - 1 ? null : (
          <span
            key={index}
            aria-hidden
            className="absolute inset-x-0 h-px bg-[var(--lm-paper-rule)]"
            style={{ top: settings.marginTop + (index + 1) * pitch - 1 }}
          />
        )
      )}
      {props.doodles.map((doodle) => (
        <div
          key={doodle.entryId}
          className="absolute"
          style={{
            top: settings.marginTop + doodle.row * pitch,
            left: settings.marginX,
            width: textWidthPx,
            height: doodle.rowCount * pitch,
          }}
          onPointerEnter={() => setHoveredEntryId(doodle.entryId)}
          onPointerLeave={() =>
            setHoveredEntryId((current) =>
              current === doodle.entryId ? undefined : current
            )
          }
        >
          <DoodleInk
            strokes={doodle.strokes}
            strokeWidthPx={props.doodle.strokeWidthPx}
            ink={doodle.ink}
            speed={props.doodle.replaySpeed}
            opacity={1}
            onComplete={() => props.controls?.onInkComplete(doodle.entryId)}
          />
        </div>
      ))}
      {pad !== undefined && (
        <>
          <div
            className="absolute"
            style={{
              top: settings.marginTop + pad.row * pitch,
              left: settings.marginX,
              width: textWidthPx,
              height: pad.rowCount * pitch,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-[6px] border border-dashed border-[var(--lm-paper-rule)]"
              style={{
                inset: `${props.doodle.padInsetPx}px -${props.doodle.padInsetPx}px`,
              }}
            />
            <DoodleInk
              strokes={pad.strokes}
              strokeWidthPx={props.doodle.strokeWidthPx}
              ink="plain"
              speed={props.doodle.replaySpeed}
              opacity={pad.tone === "remote" ? 0.45 : 1}
              onComplete={undefined}
            />
            {pad.tone === "own" && props.controls?.pad !== undefined && (
              <DoodlePad
                label={copy.notebook.padLabel}
                widthPx={textWidthPx}
                heightPx={pad.rowCount * pitch}
                strokeWidthPx={props.doodle.strokeWidthPx}
                smoothing={props.doodle.smoothing}
                simplifyPx={props.doodle.simplifyPx}
                disabled={props.controls.pad.disabled}
                onStrokeStart={props.controls.pad.onStrokeStart}
                onStroke={props.controls.pad.onStroke}
              />
            )}
          </div>
          <div
            className="absolute flex items-center justify-between text-[var(--lm-ink-pen)]"
            style={{
              top: settings.marginTop + (pad.row + pad.rowCount) * pitch,
              left: settings.marginX,
              right: settings.marginX,
              height: pitch,
              fontSize: NOTEBOOK_PAGE_METRICS.metaFontPx,
            }}
          >
            <span className="opacity-45">
              {pad.tone === "own"
                ? copy.notebook.drawingNow
                : copy.notebook.someoneDrawingNow}
            </span>
            {pad.tone === "own" && props.controls?.pad !== undefined && (
              <span className="flex items-center gap-x-1">
                {(
                  [
                    {
                      label: copy.notebook.undo,
                      onClick: props.controls.pad.onUndo,
                    },
                    {
                      label: copy.notebook.clear,
                      onClick: props.controls.pad.onClear,
                    },
                  ] satisfies { label: string; onClick: () => void }[]
                ).map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    disabled={pad.strokes.length === 0}
                    onClick={(event) => {
                      event.stopPropagation();
                      action.onClick();
                    }}
                    className="relative cursor-pointer px-1.5 opacity-45 outline-none after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] hover:opacity-80 focus-visible:opacity-80 disabled:cursor-default disabled:opacity-20"
                  >
                    {action.label}
                  </button>
                ))}
              </span>
            )}
          </div>
        </>
      )}
      {props.rows.map((row) => (
        <PageRowLine
          key={row.key}
          row={row}
          settings={settings}
          pitch={pitch}
          controls={props.controls}
          entryHovered={row.entryId === hoveredEntryId}
          onHoverChange={(hovered) =>
            setHoveredEntryId((current) =>
              hovered
                ? row.entryId
                : current === row.entryId
                  ? undefined
                  : current
            )
          }
        />
      ))}
      {props.controls?.edge !== undefined && (
        <button
          type="button"
          aria-label={
            props.side === "left"
              ? copy.notebook.previousPage
              : copy.notebook.nextPage
          }
          onClick={props.controls.edge.onClick}
          onPointerDown={props.controls.edge.onPointerDown}
          onPointerMove={(event) =>
            event.currentTarget.style.setProperty(
              "--lm-grab-y",
              `${event.nativeEvent.offsetY}px`
            )
          }
          className={cn(
            "group absolute inset-y-0 cursor-grab touch-none outline-none [--lm-grab-y:50%]",
            props.side === "left" ? "left-0" : "right-0"
          )}
          style={{ width: NOTEBOOK_PAGE_METRICS.turnEdgePx }}
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0 w-0 opacity-0 transition-[width,opacity] duration-200 ease-out",
              "group-hover:w-3 group-hover:opacity-100 group-focus-visible:w-3 group-focus-visible:opacity-100",
              "[mask-image:linear-gradient(to_bottom,transparent_calc(var(--lm-grab-y)-96px),black_var(--lm-grab-y),transparent_calc(var(--lm-grab-y)+96px))]",
              props.side === "left"
                ? "left-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.16),transparent)]"
                : "right-0 bg-[linear-gradient(to_left,rgb(0_0_0/0.16),transparent)]"
            )}
          />
        </button>
      )}
      {props.remoteCaret !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${props.remoteCaret.left}px, ${props.remoteCaret.top}px)`,
            height: pitch,
            lineHeight: `${pitch}px`,
            fontFamily: props.remoteCaret.fontFamily,
            fontSize: props.remoteCaret.fontSizePx,
          }}
        >
          <span className="-ml-px inline-block h-[0.8em] w-[2px] translate-y-[0.12em] rounded-full bg-[var(--lm-remote-pen)]" />
        </span>
      )}
      {content.kind === "paper" && (
        <button
          type="button"
          tabIndex={props.controls?.onNumber === undefined ? -1 : 0}
          aria-label={copy.notebook.pageButtonLabel({ page: content.page })}
          disabled={props.controls?.onNumber === undefined}
          onClick={props.controls?.onNumber}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 px-3",
            "font-[family-name:var(--lm-font-display)] text-[var(--lm-ink-pen)]/50 outline-none",
            "underline-offset-4 focus-visible:outline-1 focus-visible:outline-dashed enabled:cursor-pointer enabled:hover:underline"
          )}
          style={{
            bottom: NOTEBOOK_PAGE_METRICS.pageNumber.bottomPx,
            paddingBlock: NOTEBOOK_PAGE_METRICS.pageNumber.paddingYPx,
            fontSize: NOTEBOOK_PAGE_METRICS.pageNumber.fontPx,
            lineHeight: `${NOTEBOOK_PAGE_METRICS.pageNumber.lineHeightPx}px`,
          }}
        >
          {content.page}
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
  entryHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
};

function PageRowLine(props: PageRowLineProps) {
  const { copy } = useLaundromatCopy();
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
          "absolute flex items-center text-[var(--lm-ink-pen)] transition-opacity duration-300",
          row.isRtl && "flex-row-reverse"
        )}
        style={{
          ...box,
          fontSize: NOTEBOOK_PAGE_METRICS.metaFontPx,
          opacity: row.ink === "plain" ? 0.45 : 0,
        }}
        onPointerEnter={() => props.onHoverChange(true)}
        onPointerLeave={() => props.onHoverChange(false)}
      >
        <span className="truncate">{row.text}</span>
        {reportEntryId !== undefined && props.controls !== undefined && (
          <button
            type="button"
            disabled={isReported}
            onClick={() => props.controls?.onReport(reportEntryId)}
            className={cn(
              "absolute cursor-pointer px-1.5 py-1 opacity-0 transition-opacity duration-200 outline-none",
              "focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-dashed",
              (isReported || props.entryHovered) && "opacity-100"
            )}
            style={{
              right: NOTEBOOK_PAGE_METRICS.turnEdgePx - settings.marginX,
            }}
          >
            {isReported ? copy.notebook.reported : copy.notebook.report}
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
      onPointerEnter={() => props.onHoverChange(true)}
      onPointerLeave={() => props.onHoverChange(false)}
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
          {(() => {
            if (row.selected !== undefined) {
              const { from, to } = row.selected;
              return (
                <>
                  {row.text.slice(0, from)}
                  <span
                    className={
                      row.markTone === "remote"
                        ? "bg-[var(--lm-remote-pen)]/25"
                        : "bg-[var(--lm-accent)]/30"
                    }
                  >
                    {row.text.slice(from, to)}
                  </span>
                  {row.text.slice(to)}
                </>
              );
            }
            if (row.caretAt !== undefined && row.markTone === "own") {
              return (
                <>
                  {row.text.slice(0, row.caretAt)}
                  <span
                    aria-hidden
                    className="-mr-[1.5px] inline-block h-[0.8em] w-[1.5px] translate-y-[0.12em] bg-[var(--lm-accent)] motion-safe:animate-[lm-caret_1.1s_steps(1)_infinite]"
                  />
                  {row.text.slice(row.caretAt)}
                </>
              );
            }
            return row.text;
          })()}
        </span>
      )}
    </div>
  );
}
