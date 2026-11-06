"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { groupBy } from "lodash";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { CHINESE_FONT_CREDIT } from "@/lib/laundromat/notebook/chinese-font-credit";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import type { PageRow } from "@/lib/laundromat/notebook/layout-page-rows";
import { REPORT_HIDE_THRESHOLD } from "@/lib/laundromat/notebook/report-hide-threshold";
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
import { TranslateGlyph } from "./translate-glyph";

export type PageContent =
  | { kind: "cover"; number: number }
  | { kind: "inside"; number: number; span: string }
  | { kind: "paper"; page: number }
  | { kind: "blank" };

export type EntryTranslationView =
  | { kind: "none" }
  | { kind: "offer"; entryId: number }
  | { kind: "pending"; entryId: number }
  | {
      kind: "translated";
      entryId: number;
      locale: string;
      isRevealing: boolean;
      fullText: string | undefined;
    };

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
  translation: EntryTranslationView;
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
  onTranslate: (entryId: number) => void;
  onShowOriginal: (entryId: number) => void;
  onInkComplete: (entryId: string) => void;
  inkSpeed: number;
  pad: PadControls | undefined;
};

type PadControls = {
  disabled: boolean;
  isEditable: boolean;
  onStrokeStart: () => void;
  onStrokeCancel: () => void;
  onStroke: (stroke: DoodleStroke) => void;
  onScratch: (volume: number) => void;
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
  const [openSlip, setOpenSlip] = useState<{
    entryId: number;
    opener: HTMLElement | undefined;
  }>();
  const closeSlip = useCallback(() => setOpenSlip(undefined), []);
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
        className="absolute inset-0 flex flex-col items-center justify-center gap-y-6 bg-[var(--lm-paper-rule)] text-[var(--lm-ink-pen)]"
        style={{ borderRadius, boxShadow: shading }}
      >
        <div className="flex flex-col items-center gap-y-2">
          <span className="font-[family-name:var(--lm-font-display)] text-[22px] opacity-60">
            {copy.notebook.number({ number: content.number })}
          </span>
          <span className="text-[11px] opacity-50">{content.span}</span>
        </div>
        <p className="max-w-[80%] text-center text-[11px] leading-relaxed text-balance opacity-60">
          {copy.notebook.beKind}
          <br />
          {copy.notebook.reportRule({ count: REPORT_HIDE_THRESHOLD })}
        </p>
        <p className="absolute inset-x-0 bottom-5 text-center text-[10px] opacity-40">
          {copy.notebook.chineseFont} ·{" "}
          <a
            href={CHINESE_FONT_CREDIT.authorXUrl}
            target="_blank"
            rel="noopener"
            className="underline-offset-2 hover:underline"
          >
            {CHINESE_FONT_CREDIT.fontName} · @
            {CHINESE_FONT_CREDIT.authorXHandle}
          </a>
        </p>
      </div>
    );
  }

  const ruleCount = Math.round(
    (settings.height - settings.marginTop - settings.marginBottom) / pitch
  );
  const revealFromLines = Object.fromEntries(
    Object.entries(
      groupBy(
        props.rows.filter((row) => row.kind === "text"),
        (row) => row.entryId
      )
    ).map(([entryId, rows]) => [
      entryId,
      Math.min(...rows.map((row) => row.lineInEntry)),
    ])
  );
  const slip = (() => {
    const row = props.rows.find(
      (candidate) =>
        candidate.kind === "meta" &&
        candidate.translation.kind === "translated" &&
        candidate.translation.entryId === openSlip?.entryId
    );
    if (row?.translation.kind !== "translated") return undefined;
    const text = row.translation.fullText;
    if (text === undefined) return undefined;
    const firstRow = Math.min(
      ...props.rows
        .filter((candidate) => candidate.entryId === row.entryId)
        .map((candidate) => candidate.row)
    );
    const topPx = settings.marginTop + firstRow * pitch;
    const bottomPx = settings.marginTop + (row.row + 1) * pitch;
    const roomAbovePx = topPx - settings.marginTop;
    const roomBelowPx = settings.height - settings.marginBottom - bottomPx;
    const placement = (() => {
      if (Math.max(roomAbovePx, roomBelowPx) < MIN_SLIP_ROWS * pitch) {
        return { top: settings.marginTop, bottom: settings.marginBottom };
      }
      return roomAbovePx > roomBelowPx
        ? { bottom: settings.height - topPx, maxHeight: topPx - 8 }
        : { top: bottomPx, maxHeight: settings.height - bottomPx - 8 };
    })();
    return {
      row,
      text,
      locale: row.translation.locale,
      opener: openSlip?.opener,
      placement,
    };
  })();
  const { pad } = props;
  const isPadEditable = props.controls?.pad?.isEditable ?? false;
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
            replay={props.doodle.replay}
            opacity={1}
            onComplete={() => props.controls?.onInkComplete(doodle.entryId)}
            wiggle={props.doodle.wiggle}
            crayon={props.doodle.crayon}
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
              replay={props.doodle.replay}
              opacity={pad.tone === "remote" ? 0.45 : 1}
              onComplete={undefined}
              wiggle={undefined}
              crayon={props.doodle.crayon}
            />
            {pad.tone === "own" && props.controls?.pad !== undefined && (
              <DoodlePad
                label={copy.notebook.padLabel}
                widthPx={textWidthPx}
                heightPx={pad.rowCount * pitch}
                strokeWidthPx={props.doodle.strokeWidthPx}
                smoothing={props.doodle.smoothing}
                simplifyPx={props.doodle.simplifyPx}
                crayon={props.doodle.crayon}
                disabled={props.controls.pad.disabled}
                onStrokeStart={props.controls.pad.onStrokeStart}
                onStrokeCancel={props.controls.pad.onStrokeCancel}
                onStroke={props.controls.pad.onStroke}
                onScratch={props.controls.pad.onScratch}
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
                    disabled={pad.strokes.length === 0 || !isPadEditable}
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
          revealFromLine={revealFromLines[row.entryId] ?? row.lineInEntry}
          onReadAll={(entryId, opener) => setOpenSlip({ entryId, opener })}
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
      {slip !== undefined && (
        <TranslationSlip
          text={slip.text}
          fontFamily={slip.row.fontFamily}
          fontSizePx={slip.row.fontSizePx}
          rtl={slip.row.isRtl}
          lang={slip.locale}
          opener={slip.opener}
          closeLabel={copy.notebook.closeTranslation}
          onClose={closeSlip}
          style={{
            left: settings.marginX - 12,
            right: settings.marginX - 12,
            ...slip.placement,
          }}
        />
      )}
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
  revealFromLine: number;
  onReadAll: (entryId: number, opener: HTMLElement) => void;
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
        {props.controls !== undefined &&
          (reportEntryId !== undefined || row.translation.kind !== "none") && (
            <span
              className={cn(
                "absolute flex items-center",
                row.isRtl && "flex-row-reverse"
              )}
              style={{
                [row.isRtl ? "left" : "right"]:
                  NOTEBOOK_PAGE_METRICS.turnEdgePx - settings.marginX,
              }}
            >
              <TranslationControl
                translation={row.translation}
                revealed={props.entryHovered}
                labels={{
                  translate: copy.notebook.translate,
                  translating: copy.notebook.translating,
                  showOriginal: copy.notebook.showOriginal,
                  readAll: copy.notebook.readAll,
                }}
                onTranslate={props.controls.onTranslate}
                onShowOriginal={props.controls.onShowOriginal}
                onReadAll={props.onReadAll}
              />
              {reportEntryId !== undefined && (
                <button
                  type="button"
                  disabled={isReported}
                  aria-label={
                    isReported ? copy.notebook.reported : copy.notebook.report
                  }
                  onClick={() => props.controls?.onReport(reportEntryId)}
                  className={cn(
                    META_BUTTON_CLASS,
                    (isReported || props.entryHovered) && "opacity-100"
                  )}
                >
                  <span className="[@media(pointer:coarse)]:hidden">
                    {isReported ? copy.notebook.reported : copy.notebook.report}
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className={cn(
                      "hidden size-[1.1em] stroke-current [@media(pointer:coarse)]:block",
                      isReported ? "fill-current" : "fill-none"
                    )}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 11V1.5M2.5 2h7l-1.75 2.5L9.5 7h-7" />
                  </svg>
                </button>
              )}
            </span>
          )}
      </div>
    );
  }

  const textClassName = "whitespace-pre text-[var(--lm-ink-pen)]";
  const isSelectable =
    row.ink === "plain" &&
    row.selected === undefined &&
    row.caretAt === undefined;
  const textStyle = {
    fontFamily: row.fontFamily,
    fontSize: row.fontSizePx,
  };
  const isRevealing =
    row.translation.kind === "translated" && row.translation.isRevealing;
  return (
    <div
      dir={row.isRtl ? "rtl" : "ltr"}
      lang={
        row.translation.kind === "translated"
          ? row.translation.locale
          : undefined
      }
      className={cn(
        "absolute overflow-visible",
        row.translation.kind === "pending" &&
          "opacity-40 blur-[0.4px] motion-safe:animate-[lm-translating_1.1s_ease-in-out_infinite]",
        isRevealing &&
          "[animation-fill-mode:both] motion-safe:[animation-name:lm-trace] motion-safe:[animation-timing-function:linear] motion-reduce:[animation-name:lm-fade-in]"
      )}
      style={{
        ...box,
        ...textStyle,
        ...(isRevealing && {
          animationDuration: `${TRACE_LINE_MS}ms`,
          animationDelay: `${(row.lineInEntry - props.revealFromLine) * TRACE_LINE_MS}ms`,
        }),
      }}
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
          className={cn(
            textClassName,
            isSelectable && "cursor-text select-text"
          )}
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

const TRACE_LINE_MS = 650;
const MIN_SLIP_ROWS = 4;

const META_BUTTON_CLASS = cn(
  "relative cursor-pointer px-1.5 py-1 opacity-0 transition-opacity duration-200 outline-none",
  "focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-dashed",
  "[@media(pointer:coarse)]:h-full [@media(pointer:coarse)]:px-2.5 [@media(pointer:coarse)]:opacity-100"
);

type TranslationControlProps = {
  translation: EntryTranslationView;
  revealed: boolean;
  labels: {
    translate: string;
    translating: string;
    showOriginal: string;
    readAll: string;
  };
  onTranslate: (entryId: number) => void;
  onShowOriginal: (entryId: number) => void;
  onReadAll: (entryId: number, opener: HTMLElement) => void;
};

function TranslationControl(props: TranslationControlProps) {
  const { translation, labels } = props;
  switch (translation.kind) {
    case "none":
      return null;
    case "offer":
      return (
        <button
          type="button"
          aria-label={labels.translate}
          onClick={() => props.onTranslate(translation.entryId)}
          className={cn(META_BUTTON_CLASS, props.revealed && "opacity-100")}
        >
          <span className="[@media(pointer:coarse)]:hidden">
            {labels.translate}
          </span>
          <span className="hidden [@media(pointer:coarse)]:block">
            <TranslateGlyph className="size-[1.2em]" />
          </span>
        </button>
      );
    case "pending":
      return (
        <span
          role="status"
          className="px-1.5 py-1 motion-safe:animate-[lm-translating_1.1s_ease-in-out_infinite]"
        >
          <span className="[@media(pointer:coarse)]:hidden">
            {labels.translating}
          </span>
          <span className="hidden [@media(pointer:coarse)]:block">
            <TranslateGlyph className="size-[1.2em]" />
          </span>
        </span>
      );
    case "translated":
      return (
        <>
          {translation.fullText !== undefined && (
            <button
              type="button"
              aria-label={labels.readAll}
              onClick={(event) => {
                event.stopPropagation();
                props.onReadAll(translation.entryId, event.currentTarget);
              }}
              className={cn(META_BUTTON_CLASS, "opacity-100")}
            >
              <span className="[@media(pointer:coarse)]:hidden">
                {labels.readAll}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 14 14"
                className="hidden size-[1.2em] fill-none stroke-current [@media(pointer:coarse)]:block"
                strokeWidth={1}
                strokeLinecap="round"
              >
                <path d="M2.5 3.5h9M2.5 7h9M2.5 10.5h5" />
              </svg>
            </button>
          )}
          <button
            type="button"
            aria-label={labels.showOriginal}
            title={labels.showOriginal}
            onClick={() => props.onShowOriginal(translation.entryId)}
            className={cn(META_BUTTON_CLASS, "opacity-100")}
          >
            <svg
              aria-hidden
              viewBox="0 0 14 14"
              className="size-[1.2em] fill-none stroke-current"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 2.5 2 5.5l3 3M2.5 5.5H9a3 3 0 0 1 0 6H6" />
            </svg>
          </button>
        </>
      );
    default: {
      const unreachable: never = translation;
      return unreachable;
    }
  }
}

type TranslationSlipProps = {
  text: string;
  fontFamily: string;
  fontSizePx: number;
  rtl: boolean;
  lang: string;
  opener: HTMLElement | undefined;
  closeLabel: string;
  onClose: () => void;
  style: React.CSSProperties;
};

function TranslationSlip(props: TranslationSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);
  const { onClose, opener } = props;
  const closeAndRefocus = useCallback(() => {
    onClose();
    opener?.focus({ preventScroll: true });
  }, [onClose, opener]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      closeAndRefocus();
    }
    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        slipRef.current?.contains(event.target)
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClose, closeAndRefocus]);

  return (
    <div
      ref={slipRef}
      role="dialog"
      className="absolute z-10 flex min-h-0 -rotate-[0.6deg] flex-col gap-y-1.5 rounded-[4px] bg-[var(--lm-paper)] px-3.5 pt-3 pb-2 text-[var(--lm-ink-pen)] shadow-[0_1px_2px_rgb(0_0_0/0.25),0_12px_28px_rgb(0_0_0/0.28)]"
      style={props.style}
    >
      <p
        dir={props.rtl ? "rtl" : "ltr"}
        lang={props.lang}
        className="m-0 min-h-0 overflow-y-auto overscroll-contain leading-[1.3] whitespace-pre-wrap select-text"
        style={{ fontFamily: props.fontFamily, fontSize: props.fontSizePx }}
      >
        {props.text}
      </p>
      <button
        type="button"
        autoFocus
        onClick={closeAndRefocus}
        className="cursor-pointer self-end px-1 py-0.5 text-[11px] lowercase opacity-60 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-dashed"
      >
        {props.closeLabel}
      </button>
    </div>
  );
}
