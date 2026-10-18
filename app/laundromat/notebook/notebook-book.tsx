"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { uniq } from "lodash";
import { motion, useIsPresent, useTransform } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { decodeDoodle } from "@/lib/laundromat/notebook/decode-doodle";
import { describeEntryMeta } from "@/lib/laundromat/notebook/describe-entry-meta";
import type { LeaveEntryFailure } from "@/lib/laundromat/notebook/describe-leave-failure";
import { describeLeaveFailure } from "@/lib/laundromat/notebook/describe-leave-failure";
import { detectScript } from "@/lib/laundromat/notebook/detect-script";
import { DOODLE_LIMITS } from "@/lib/laundromat/notebook/doodle-limits";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { encodeDoodle } from "@/lib/laundromat/notebook/encode-doodle";
import { fitEntry } from "@/lib/laundromat/notebook/fit-entry";
import { fitsNotebook } from "@/lib/laundromat/notebook/fits-notebook";
import { formatEntryDay } from "@/lib/laundromat/notebook/format-entry-day";
import { getDoodlePlacement } from "@/lib/laundromat/notebook/get-doodle-placement";
import { getDraftPlacement } from "@/lib/laundromat/notebook/get-draft-placement";
import { getDraftRowMarks } from "@/lib/laundromat/notebook/get-draft-row-marks";
import { getEntryLineCount } from "@/lib/laundromat/notebook/get-entry-line-count";
import { getEntrySpreads } from "@/lib/laundromat/notebook/get-entry-spreads";
import { getRestingPlacedAt } from "@/lib/laundromat/notebook/get-resting-placed-at";
import { getSpreadOfPage } from "@/lib/laundromat/notebook/get-spread-of-page";
import { isRtlScript } from "@/lib/laundromat/notebook/is-rtl-script";
import { keepTrailingSpace } from "@/lib/laundromat/notebook/keep-trailing-space";
import type { FittedEntry } from "@/lib/laundromat/notebook/layout-page-rows";
import { layoutPageRows } from "@/lib/laundromat/notebook/layout-page-rows";
import { parseDoodleDrawing } from "@/lib/laundromat/notebook/parse-doodle-drawing";
import { wrapEntryLines } from "@/lib/laundromat/notebook/wrap-entry-lines";
import { wrapEntryText } from "@/lib/laundromat/notebook/wrap-entry-text";
import type { NotebookLock } from "@/lib/laundromat/realtime/notebook-lock";
import type {
  DraftContent,
  RemoteDraft,
  RemoteEntry,
} from "@/lib/laundromat/realtime/room-presence";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";
import { cn } from "@/lib/utils";

import { getPageRadius } from "./get-page-radius";
import { HANDWRITING_FONT_FAMILIES } from "./handwriting-fonts";
import type {
  LeaveEntryResult,
  NotebookResult,
  NotebookView,
} from "./notebook-actions";
import {
  leaveDoodle,
  leaveEntry,
  loadNotebook,
  reportNotebookEntry,
} from "./notebook-actions";
import type {
  DoodleView,
  PadView,
  PageContent,
  RemoteCaret,
  RowView,
} from "./notebook-page";
import { NotebookPage } from "./notebook-page";
import { NotebookPhoneBar } from "./notebook-phone-bar";
import type { CurlTurn } from "./page-curl-canvas";
import { CURL_REST_PROGRESS, PageCurlCanvas } from "./page-curl-canvas";
import { PageLeaf } from "./page-leaf";
import { PageScrubber } from "./page-scrubber";
import type { PageSpec } from "./paint-page-texture";
import { ReportEntryDialog } from "./report-entry-dialog";
import { ShortcutHint } from "./shortcut-hint";
import { useBookTurns } from "./use-book-turns";
import { useIsNarrowScreen } from "./use-is-narrow-screen";
import { usePageDrag } from "./use-page-drag";
import { useTextMeasurers } from "./use-text-measurers";

const DRAFT_STORAGE_KEY = "laundromat:notebook-draft";
const DOODLE_STORAGE_KEY = "laundromat:notebook-doodle";
const PLACED_AT_STORAGE_KEY = "laundromat:notebook-placed-at";
const APPEND_ENTRY_INTERVAL_MS = 2 * 60_000;
const DRAFT_ID = "draft";
const FADE_MS = 220;
const WRITING_IDLE_RELEASE_MS = 90_000;
const TAB_SPACES = "    ";

type BookPhase = "closed" | "opening" | "open";

type PenMode = "write" | "draw";

type PlacedEntry = Extract<LeaveEntryResult, { kind: "placed" }>;

type EntryStyle = {
  script: NotebookScript;
  fontFamily: string;
  fontSizePx: number;
  isRtl: boolean;
  reportEntryId: number | undefined;
};

type NotebookBookProps = {
  config: SceneConfig;
  bookNumber: number | undefined;
  coverNumber: number;
  reducedMotion: boolean;
  pageCurl: boolean;
  onPlaced: () => void;
  onClose: () => void;
  lock: NotebookLock;
  freeNoticeOn: boolean;
  onWritingChange: (isWriting: boolean) => void;
  onDraftChange: (draft: DraftContent) => void;
  onUnsavedChange: (hasUnsavedNote: boolean) => void;
  remoteEntry: RemoteEntry | undefined;
  onEntryPlaced: (entry: Omit<RemoteEntry, "sessionId">) => void;
  onRequestFreeNotice: () => void;
  onFocusPageChange: (side: "left" | "right" | undefined) => void;
};

function createOfflineNotebook(options: {
  number: number;
  config: SceneConfig;
}): NotebookView {
  return {
    number: options.number,
    pageCount: options.config.notebook.offlineBook.pageCount,
    linesPerPage: options.config.notebook.offlineBook.linesPerPage,
    linesUsed: 0,
    startedAt: new Date().toISOString(),
    filledAt: null,
    entries: [],
  };
}

function readStoredDraft() {
  try {
    return window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function readStoredPlacedAt() {
  try {
    return getRestingPlacedAt({
      stored: window.localStorage.getItem(PLACED_AT_STORAGE_KEY),
      now: Date.now(),
      intervalMs: APPEND_ENTRY_INTERVAL_MS,
    });
  } catch {
    return undefined;
  }
}

function writeStoredPlacedAt(placedAt: number) {
  try {
    window.localStorage.setItem(PLACED_AT_STORAGE_KEY, String(placedAt));
  } catch {
    return;
  }
}

function storePlacedAtNow() {
  const placedAt = Date.now();
  writeStoredPlacedAt(placedAt);
  return placedAt;
}

function writeStoredDraft(value: string) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, value);
  } catch {
    return;
  }
}

function readStoredDoodle(widthPx: number) {
  try {
    const stored = window.localStorage.getItem(DOODLE_STORAGE_KEY);
    const drawing =
      stored === null ? undefined : parseDoodleDrawing(JSON.parse(stored));
    return drawing === undefined ? [] : decodeDoodle({ drawing, widthPx });
  } catch {
    return [];
  }
}

function writeStoredDoodle(options: {
  strokes: DoodleStroke[];
  widthPx: number;
}) {
  try {
    if (options.strokes.length === 0) {
      window.localStorage.removeItem(DOODLE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      DOODLE_STORAGE_KEY,
      JSON.stringify(encodeDoodle(options))
    );
  } catch {
    return;
  }
}

export function NotebookBook(props: NotebookBookProps) {
  const { copy } = useLaundromatCopy();
  const { config } = props;
  const settings = config.notebook.page;
  const details = config.details.notebook;
  const doodle = config.notebook.doodle;
  const isWritable = props.bookNumber === undefined;
  const { quality } = useRenderQuality();
  const isNarrowScreen = useIsNarrowScreen();
  const [isReloading, setIsReloading] = useState(true);
  const [placedAt, setPlacedAt] = useState<number>();
  const canWrite =
    isWritable &&
    props.lock.kind === "free" &&
    !isReloading &&
    placedAt === undefined;

  const [result, setResult] = useState<NotebookResult>();
  const [phase, setPhase] = useState<BookPhase>("closed");
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<PenMode>("write");
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [failure, setFailure] = useState<LeaveEntryFailure>();
  const [isLeaving, setIsLeaving] = useState(false);
  const [ink, setInk] = useState<{ entryId: string; line: number }>();
  const [reportedIds, setReportedIds] = useState<number[]>([]);
  const [reportingEntryId, setReportingEntryId] = useState<number>();
  const [isJumping, setIsJumping] = useState(false);
  const [isCurlUnsupported, setIsCurlUnsupported] = useState(false);
  const curlMode = props.pageCurl && !isCurlUnsupported ? "webgl" : "css";
  const [localEntries, setLocalEntries] = useState<NotebookView["entries"]>([]);
  const [handoffDraft, setHandoffDraft] = useState<RemoteDraft>();
  const [isLifted, setIsLifted] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [hasWaitedMax, setHasWaitedMax] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const { getMeasure, loadMeasure } = useTextMeasurers();

  const riffleMs =
    details.riffleSheetMs +
    details.riffleStaggerMs * (details.riffleSheets - 1);
  const turns = useBookTurns({
    turnMs: details.turnMs,
    riffleMs,
    fadeMs: FADE_MS,
    ease: details.turnEase,
    reducedMotion: props.reducedMotion,
  });
  const { spread, turn, goToSpread, setSpread } = turns;
  const sound = useSoundBoard();

  useEffect(() => {
    if (turn === undefined || turn.kind === "fade") return;
    if (turn.kind === "turn") {
      if (turn.driver === "auto") sound?.play("page-flip");
      return;
    }
    const timers = Array.from({ length: details.riffleSheets }, (_, index) =>
      window.setTimeout(
        () => sound?.play("page-flip", { volume: 0.6 }),
        index * details.riffleStaggerMs
      )
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [turn, sound, details.riffleSheets, details.riffleStaggerMs]);
  const handleEdgePointerDown = usePageDrag({
    bookRef,
    restProgress: curlMode === "webgl" ? CURL_REST_PROGRESS : 0,
    startDrag: turns.startDrag,
    moveDrag: turns.moveDrag,
    endDrag: turns.endDrag,
    onFlip: () => sound?.play("page-flip"),
  });
  const leafAngle = useTransform(turns.progress, (value) => value * -180);

  const notebook = useMemo(() => {
    const loaded =
      result?.kind === "online"
        ? result.notebook
        : createOfflineNotebook({ number: props.coverNumber, config });
    const entries = [...loaded.entries, ...localEntries];
    const lastEntry = entries.at(-1);
    const linesUsed =
      lastEntry === undefined
        ? loaded.linesUsed
        : Math.max(
            loaded.linesUsed,
            (lastEntry.page - 1) * loaded.linesPerPage +
              lastEntry.lineStart -
              1 +
              lastEntry.lineCount
          );
    return { ...loaded, entries, linesUsed };
  }, [result, localEntries, props.coverNumber, config]);

  const bodyHeight =
    settings.height - settings.marginTop - settings.marginBottom;
  const pitch = bodyHeight / notebook.linesPerPage;
  const maxWidthPx = settings.width - settings.marginX * 2;
  const lastSpread = getSpreadOfPage(notebook.pageCount + 1);
  const inkedSpreads = useMemo(
    () =>
      uniq(
        notebook.entries.flatMap((entry) =>
          getEntrySpreads({ ...entry, linesPerPage: notebook.linesPerPage })
        )
      ),
    [notebook.entries, notebook.linesPerPage]
  );

  const isPageKeysOn = phase === "open";
  useEffect(() => {
    if (!isPageKeysOn) return;
    function handlePageKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
      const target = event.target;
      const isCaretAtTextEdge =
        target instanceof HTMLTextAreaElement &&
        !event.shiftKey &&
        !event.altKey &&
        !event.isComposing &&
        target.selectionStart === target.selectionEnd &&
        ((event.key === "ArrowLeft" && target.selectionStart === 0) ||
          (event.key === "ArrowRight" &&
            target.selectionEnd === target.value.length));
      if (
        !isCaretAtTextEdge &&
        (target instanceof HTMLTextAreaElement ||
          target instanceof HTMLInputElement ||
          (target instanceof HTMLElement && target.isContentEditable))
      ) {
        return;
      }
      if (event.key === "ArrowRight" && spread < lastSpread) {
        event.preventDefault();
        goToSpread(spread + 1);
      }
      if (event.key === "ArrowLeft" && spread > 0) {
        event.preventDefault();
        goToSpread(spread - 1);
      }
    }
    window.addEventListener("keydown", handlePageKey);
    return () => window.removeEventListener("keydown", handlePageKey);
  }, [isPageKeysOn, spread, lastSpread, goToSpread]);

  const getEntryStyle = useCallback(
    (options: {
      script: NotebookScript;
      reportEntryId: number | undefined;
    }) => {
      const fontSizePx = Math.round(
        pitch * config.notebook.fontSizeRatio[options.script]
      );
      return {
        script: options.script,
        fontFamily: HANDWRITING_FONT_FAMILIES[options.script],
        fontSizePx,
        isRtl: isRtlScript(options.script),
        reportEntryId: options.reportEntryId,
      };
    },
    [pitch, config.notebook.fontSizeRatio]
  );

  const stored = useMemo(() => {
    return notebook.entries.map((entry) => {
      const isHidden =
        entry.kind === "text" ? entry.body === "" : entry.drawing === undefined;
      const style = getEntryStyle({
        script: entry.script,
        reportEntryId: isHidden ? undefined : entry.id,
      });
      const fitted: FittedEntry = {
        id: String(entry.id),
        page: entry.page,
        lineStart: entry.lineStart,
        lineCount: entry.lineCount,
        lines:
          isHidden || entry.kind === "doodle"
            ? []
            : wrapEntryText({
                text: entry.body,
                maxWidthPx,
                measure: getMeasure(style),
              }),
        meta: isHidden
          ? undefined
          : describeEntryMeta({
              signOff: entry.signOff,
              createdAtMs: Date.parse(entry.createdAt),
              locale: copy.locale,
            }),
      };
      return { fitted, style };
    });
  }, [notebook.entries, getEntryStyle, getMeasure, maxWidthPx, copy.locale]);

  const storedDoodles = useMemo(
    () =>
      notebook.entries.flatMap((entry) =>
        entry.kind === "doodle" && entry.drawing !== undefined
          ? [
              {
                id: String(entry.id),
                page: entry.page,
                row: entry.lineStart - 1,
                rowCount: entry.lineCount - 1,
                strokes: decodeDoodle({
                  drawing: entry.drawing,
                  widthPx: maxWidthPx,
                }),
              },
            ]
          : []
      ),
    [notebook.entries, maxWidthPx]
  );

  const takenDraft = props.lock.kind === "taken" ? props.lock.draft : undefined;
  const remoteDraft = props.lock.kind === "taken" ? takenDraft : handoffDraft;
  const isRemoteDraft =
    props.lock.kind === "taken" || handoffDraft !== undefined;
  const shownMode: PenMode = (() => {
    if (!isRemoteDraft) return mode;
    return remoteDraft?.kind === "doodle" ? "draw" : "write";
  })();
  const pageDraft = (() => {
    if (isRemoteDraft)
      return remoteDraft?.kind === "text" ? remoteDraft.text : "";
    return draft;
  })();
  const trimmedDraft = pageDraft.trimEnd();
  const draftScript =
    remoteDraft?.kind === "text"
      ? remoteDraft.script
      : detectScript(trimmedDraft);
  const remoteDrawing =
    remoteDraft?.kind === "doodle" ? remoteDraft.drawing : undefined;
  const remoteStrokes = useMemo(
    () =>
      remoteDrawing === undefined
        ? []
        : decodeDoodle({ drawing: remoteDrawing, widthPx: maxWidthPx }),
    [remoteDrawing, maxWidthPx]
  );
  const shownStrokes = isRemoteDraft ? remoteStrokes : strokes;
  const pointCount = strokes.reduce(
    (total, stroke) => total + stroke.points.length,
    0
  );
  const isInkFull =
    pointCount >= DOODLE_LIMITS.maxPoints ||
    strokes.length >= DOODLE_LIMITS.maxStrokes;
  const draftStyle = getEntryStyle({
    script: draftScript,
    reportEntryId: undefined,
  });
  const draftFit = fitEntry({
    text: trimmedDraft,
    maxWidthPx,
    measure: getMeasure(draftStyle),
    linesPerPage: notebook.linesPerPage,
  });
  const shownDraftLines = keepTrailingSpace({
    lines: wrapEntryLines({
      text: pageDraft,
      maxWidthPx,
      measure: getMeasure(draftStyle),
    }),
    text: pageDraft,
    maxWidthPx,
    measure: getMeasure(draftStyle),
  });
  const draftPlacement = getDraftPlacement({
    linesUsed: notebook.linesUsed,
    lineCount: Math.max(2, getEntryLineCount(shownDraftLines.length)),
    linesPerPage: notebook.linesPerPage,
    pageCount: notebook.pageCount,
  });
  const doodlePlacement = getDoodlePlacement({
    linesUsed: notebook.linesUsed,
    spaceLineCount: doodle.maxRows + 1,
    linesPerPage: notebook.linesPerPage,
    pageCount: notebook.pageCount,
  });
  const isPadVisible =
    isWritable &&
    shownMode === "draw" &&
    !doodlePlacement.startsNewBook &&
    (isRemoteDraft || canWrite);
  const padSpread = getSpreadOfPage(doodlePlacement.page);
  const writeSpread = isPadVisible
    ? padSpread
    : getSpreadOfPage(draftPlacement.caretPage);
  const padSide = doodlePlacement.page % 2 === 0 ? "left" : "right";
  const isSinglePage =
    isNarrowScreen && isPadVisible && phase === "open" && spread === padSpread;
  const shownSelection = (() => {
    if (!isRemoteDraft) return selection;
    return (
      (remoteDraft?.kind === "text" ? remoteDraft.selection : undefined) ?? {
        start: pageDraft.length,
        end: pageDraft.length,
      }
    );
  })();
  const markTone = isRemoteDraft ? "remote" : "own";
  const isDraftVisible =
    isWritable &&
    shownMode === "write" &&
    !draftPlacement.startsNewBook &&
    (canWrite || trimmedDraft !== "");
  const draftEntry: FittedEntry | undefined = isDraftVisible
    ? {
        id: DRAFT_ID,
        page: draftPlacement.page,
        lineStart: draftPlacement.lineStart,
        lineCount: Math.max(1, shownDraftLines.length),
        lines:
          shownDraftLines.length === 0
            ? [""]
            : shownDraftLines.map((line) => line.text),
        meta: undefined,
      }
    : undefined;

  const styles: { [entryId: string]: EntryStyle } = {
    ...Object.fromEntries(
      stored.map(({ fitted, style }) => [fitted.id, style])
    ),
    [DRAFT_ID]: draftStyle,
  };
  const fittedEntries = [
    ...stored.map(({ fitted }) => fitted),
    ...(draftEntry === undefined ? [] : [draftEntry]),
  ];

  function getInkState(options: {
    entryId: string;
    kind: "text" | "meta";
    lineInEntry: number;
  }): RowView["ink"] {
    if (ink === undefined || ink.entryId !== options.entryId) return "plain";
    if (options.kind === "meta") return "waiting";
    if (options.lineInEntry < ink.line) return "plain";
    return options.lineInEntry === ink.line ? "inking" : "waiting";
  }

  function getPageContent(page: number): PageContent {
    if (page === 0) {
      const started = formatEntryDay({
        timestampMs: Date.parse(notebook.startedAt),
        locale: copy.locale,
      });
      const span =
        notebook.filledAt === null
          ? copy.notebook.since({ day: started })
          : copy.notebook.daySpan({
              from: started,
              to: formatEntryDay({
                timestampMs: Date.parse(notebook.filledAt),
                locale: copy.locale,
              }),
            });
      return { kind: "inside", number: notebook.number, span };
    }
    if (page > notebook.pageCount) return { kind: "blank" };
    return { kind: "paper", page };
  }

  function getPageSpec(page: number): PageSpec {
    const content = getPageContent(page);
    if (content.kind !== "paper") {
      return { content, rows: [], doodles: [], pad: undefined };
    }
    const doodles = storedDoodles.flatMap((entry): DoodleView[] =>
      entry.page === page
        ? [
            {
              entryId: entry.id,
              row: entry.row,
              rowCount: entry.rowCount,
              strokes: entry.strokes,
              ink: getInkState({
                entryId: entry.id,
                kind: "text",
                lineInEntry: 0,
              }),
            },
          ]
        : []
    );
    const pad: PadView | undefined =
      isPadVisible && doodlePlacement.page === page
        ? {
            row: doodlePlacement.lineStart - 1,
            rowCount: doodle.maxRows,
            strokes: shownStrokes,
            tone: isRemoteDraft ? "remote" : "own",
          }
        : undefined;
    const rows = layoutPageRows({
      entries: fittedEntries,
      page,
      linesPerPage: notebook.linesPerPage,
    }).flatMap((row): RowView[] => {
      const style = styles[row.entryId];
      if (style === undefined) return [];
      const line =
        row.entryId === DRAFT_ID &&
        row.kind === "text" &&
        phase === "open" &&
        (canWrite || isRemoteDraft)
          ? shownDraftLines.at(row.lineInEntry)
          : undefined;
      const marks =
        line === undefined
          ? { selected: undefined, caretAt: undefined }
          : getDraftRowMarks({
              start: line.start,
              length: line.text.length,
              nextStart: shownDraftLines.at(row.lineInEntry + 1)?.start,
              selection: shownSelection,
            });
      return [{ ...row, ...style, ink: getInkState(row), ...marks, markTone }];
    });
    return { content, rows, doodles, pad };
  }

  function getRemoteCaret(rows: RowView[]): RemoteCaret | undefined {
    if (props.lock.kind !== "taken") return undefined;
    const row = rows.find(
      (candidate) =>
        candidate.entryId === DRAFT_ID && candidate.caretAt !== undefined
    );
    if (row === undefined || row.caretAt === undefined) return undefined;
    const offsetPx = getMeasure(draftStyle)(row.text.slice(0, row.caretAt));
    return {
      left: row.isRtl
        ? settings.width - settings.marginX - offsetPx
        : settings.marginX + offsetPx,
      top:
        settings.marginTop + row.row * pitch + pitch * settings.textDropRatio,
      fontFamily: row.fontFamily,
      fontSizePx: row.fontSizePx,
    };
  }

  const restoredDraftRef = useRef("");
  const restoredStrokesRef = useRef<DoodleStroke[]>([]);
  useEffect(() => {
    const restored = readStoredDraft();
    restoredDraftRef.current = restored;
    setDraft(restored);
    const restoredStrokes = readStoredDoodle(maxWidthPx);
    restoredStrokesRef.current = restoredStrokes;
    setStrokes(restoredStrokes);
    if (restoredStrokes.length > 0 && restored.trim() === "") setMode("draw");
    setPlacedAt(readStoredPlacedAt());
    function handleStorage(event: StorageEvent) {
      if (event.key === PLACED_AT_STORAGE_KEY) {
        setPlacedAt(readStoredPlacedAt());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [maxWidthPx]);
  useEffect(() => {
    if (placedAt === undefined) return;
    const timeout = window.setTimeout(
      () => setPlacedAt(undefined),
      placedAt + APPEND_ENTRY_INTERVAL_MS - Date.now()
    );
    return () => window.clearTimeout(timeout);
  }, [placedAt]);

  const loadRequestRef = useRef(0);
  const pendingEntryPageRef = useRef<number>(undefined);
  const reloadNotebook = useCallback(
    async (bookNumber: number | undefined) => {
      loadRequestRef.current += 1;
      const request = loadRequestRef.current;
      setIsReloading(true);
      const next = await loadNotebook(bookNumber).catch(
        (): NotebookResult => ({ kind: "offline" })
      );
      if (request !== loadRequestRef.current) return false;
      setIsReloading(false);
      if (lockRef.current.kind !== "taken") setHandoffDraft(undefined);
      if (next.kind === "offline") {
        pendingEntryPageRef.current = undefined;
        setResult((current) => (current?.kind === "online" ? current : next));
        return true;
      }
      setResult(next);
      setLocalEntries([]);
      const entryPage = pendingEntryPageRef.current;
      pendingEntryPageRef.current = undefined;
      if (
        next.kind === "online" &&
        entryPage !== undefined &&
        entryPage <= next.notebook.pageCount
      ) {
        setSpread(getSpreadOfPage(entryPage));
      }
      return true;
    },
    [setSpread]
  );

  useEffect(() => {
    void reloadNotebook(props.bookNumber);
    return () => {
      loadRequestRef.current += 1;
    };
  }, [props.bookNumber, reloadNotebook]);

  const arrivalSpread = isWritable ? writeSpread : 0;
  useEffect(() => {
    if (result === undefined || isContentReady) return;
    if (result.kind !== "online") {
      setIsContentReady(true);
      return;
    }
    const { linesPerPage } = result.notebook;
    const entries = result.notebook.entries.flatMap((entry) =>
      entry.kind === "text" &&
      getEntrySpreads({ ...entry, linesPerPage }).includes(arrivalSpread)
        ? [entry]
        : []
    );
    const state = { isCurrent: true };
    void Promise.all(
      uniq(entries.map((entry) => entry.script)).map((script) => {
        const style = getEntryStyle({ script, reportEntryId: undefined });
        return document.fonts
          .load(
            `${style.fontSizePx}px ${style.fontFamily}`,
            entries
              .filter((entry) => entry.script === script)
              .map((entry) => entry.body)
              .join("")
          )
          .catch(() => []);
      })
    ).then(() => {
      if (state.isCurrent) setIsContentReady(true);
    });
    return () => {
      state.isCurrent = false;
    };
  }, [result, isContentReady, arrivalSpread, getEntryStyle]);

  useEffect(() => {
    const liftTimer = window.setTimeout(
      () => setIsLifted(true),
      props.reducedMotion ? 0 : details.liftMs
    );
    const waitTimer = window.setTimeout(
      () => setHasWaitedMax(true),
      details.openWaitMaxMs
    );
    return () => {
      window.clearTimeout(liftTimer);
      window.clearTimeout(waitTimer);
    };
  }, [props.reducedMotion, details.liftMs, details.openWaitMaxMs]);

  const shouldOpen = isLifted && (isContentReady || hasWaitedMax);
  const isCoverBreathing = isLifted && !shouldOpen && !props.reducedMotion;
  const coverWaitDeg = isCoverBreathing ? -details.coverCrackDeg : 0;
  useEffect(() => {
    if (!shouldOpen) return;
    if (props.reducedMotion) {
      setPhase("open");
      return;
    }
    setPhase("opening");
    const doneTimer = window.setTimeout(
      () => setPhase("open"),
      details.coverOpenMs
    );
    return () => window.clearTimeout(doneTimer);
  }, [shouldOpen, props.reducedMotion, details.coverOpenMs]);

  const hasArrivedRef = useRef(false);
  useEffect(() => {
    if (phase !== "open" || result === undefined || hasArrivedRef.current) {
      return;
    }
    hasArrivedRef.current = true;
    const target = isWritable ? writeSpread : 0;
    if (target !== spread) goToSpread(target);
    if (canWrite && mode === "write") {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [
    phase,
    result,
    isWritable,
    canWrite,
    mode,
    writeSpread,
    spread,
    goToSpread,
  ]);

  const { onWritingChange } = props;
  const lockRef = useRef(props.lock);
  useEffect(() => {
    lockRef.current = props.lock;
  }, [props.lock]);

  const { bookNumber, onPlaced } = props;
  const isTaken = props.lock.kind === "taken";
  useEffect(() => {
    if (isTaken) setHandoffDraft(takenDraft);
  }, [isTaken, takenDraft]);
  const wasTakenRef = useRef(isTaken);
  useEffect(() => {
    const wasTaken = wasTakenRef.current;
    wasTakenRef.current = isTaken;
    if (!isWritable || !wasTaken || isTaken) return;
    void reloadNotebook(bookNumber).then((isLatest) => {
      if (isLatest) onPlaced();
    });
  }, [isWritable, isTaken, bookNumber, onPlaced, reloadNotebook]);

  const writerSessionIdRef = useRef<string>(undefined);
  useEffect(() => {
    if (props.lock.kind === "taken") {
      writerSessionIdRef.current = props.lock.writerSessionId;
    }
  }, [props.lock]);

  const { remoteEntry, reducedMotion } = props;
  const handledEntryIdRef = useRef(props.remoteEntry?.entry.id);
  useLayoutEffect(() => {
    if (
      remoteEntry === undefined ||
      !isWritable ||
      handledEntryIdRef.current === remoteEntry.entry.id
    ) {
      return;
    }
    handledEntryIdRef.current = remoteEntry.entry.id;
    const isFromWriter =
      remoteEntry.sessionId === writerSessionIdRef.current &&
      (isTaken || handoffDraft !== undefined);
    if (!isFromWriter) return;
    setHandoffDraft(undefined);
    const { entry } = remoteEntry;
    if (remoteEntry.notebookNumber !== notebook.number) {
      pendingEntryPageRef.current = entry.page;
      void reloadNotebook(undefined);
      return;
    }
    const { linesPerPage, pageCount } = notebook;
    if (
      !fitsNotebook({ ...entry, linesPerPage, pageCount }) ||
      notebook.entries.some((existing) => existing.id === entry.id)
    ) {
      return;
    }
    setLocalEntries((entries) => [...entries, entry]);
    const entrySpreads = getEntrySpreads({ ...entry, linesPerPage });
    const canReplay =
      !reducedMotion &&
      (entry.kind === "text" || quality === "full") &&
      entrySpreads.length === 1 &&
      entrySpreads.at(0) === spread;
    setInk(canReplay ? { entryId: String(entry.id), line: 0 } : undefined);
  }, [
    remoteEntry,
    isWritable,
    isTaken,
    handoffDraft,
    notebook,
    reloadNotebook,
    spread,
    reducedMotion,
    quality,
  ]);

  useEffect(() => {
    if (isTaken) onWritingChange(false);
  }, [isTaken, onWritingChange]);
  useEffect(() => {
    if (!canWrite) return;
    const timeout = window.setTimeout(
      () => onWritingChange(false),
      WRITING_IDLE_RELEASE_MS
    );
    return () => window.clearTimeout(timeout);
  }, [canWrite, draft, strokes, onWritingChange]);

  useEffect(() => () => onWritingChange(false), [onWritingChange]);

  const isPresent = useIsPresent();
  const onDraftChangeRef = useRef(props.onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = props.onDraftChange;
  });
  useEffect(() => {
    if (isPresent || !isWritable) return;
    onWritingChange(false);
    onDraftChangeRef.current({ kind: "text", text: "", script: "latin" });
  }, [isPresent, isWritable, onWritingChange]);
  useEffect(() => {
    const restored = restoredDraftRef.current;
    const restoredStrokes = restoredStrokesRef.current;
    if ((restored === "" && restoredStrokes.length === 0) || !canWrite) return;
    restoredDraftRef.current = "";
    restoredStrokesRef.current = [];
    onWritingChange(true);
    onDraftChangeRef.current(
      restored === ""
        ? {
            kind: "doodle",
            drawing: encodeDoodle({
              strokes: restoredStrokes,
              widthPx: maxWidthPx,
            }),
          }
        : {
            kind: "text",
            text: restored,
            script: detectScript(restored),
          }
    );
  }, [canWrite, onWritingChange, maxWidthPx]);

  const { onFocusPageChange } = props;
  useEffect(() => {
    onFocusPageChange(isSinglePage ? padSide : undefined);
  }, [isSinglePage, padSide, onFocusPageChange]);
  useEffect(() => () => onFocusPageChange(undefined), [onFocusPageChange]);

  const hasUnsavedNote =
    canWrite && (draft.trim() !== "" || strokes.length > 0);
  const { onUnsavedChange } = props;
  useEffect(() => {
    onUnsavedChange(hasUnsavedNote);
  }, [hasUnsavedNote, onUnsavedChange]);
  useEffect(() => () => onUnsavedChange(false), [onUnsavedChange]);

  const lastDraftRef = useRef(pageDraft);
  useEffect(() => {
    const didDraftChange = lastDraftRef.current !== pageDraft;
    lastDraftRef.current = pageDraft;
    if (
      !didDraftChange ||
      !hasArrivedRef.current ||
      !isDraftVisible ||
      isRemoteDraft
    ) {
      return;
    }
    if (writeSpread !== spread) goToSpread(writeSpread);
  }, [
    pageDraft,
    writeSpread,
    spread,
    goToSpread,
    isDraftVisible,
    isRemoteDraft,
  ]);

  const lastModeRef = useRef(mode);
  useEffect(() => {
    const didModeChange = lastModeRef.current !== mode;
    lastModeRef.current = mode;
    if (!didModeChange || !hasArrivedRef.current || isRemoteDraft) return;
    if (writeSpread !== spread) goToSpread(writeSpread);
  }, [mode, writeSpread, spread, goToSpread, isRemoteDraft]);

  function handleDraftChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value.slice(0, config.notebook.maxChars);
    setDraft(next);
    const nextSelection = readSelection(event.target);
    setFailure(undefined);
    writeStoredDraft(next);
    if (next.trim() !== "") props.onWritingChange(true);
    props.onDraftChange({
      kind: "text",
      text: next,
      script: detectScript(next),
      selection: nextSelection,
    });
  }

  function handleSelect(textarea: HTMLTextAreaElement) {
    const nextSelection = readSelection(textarea);
    if (!canWrite || draft.trim() === "") return;
    props.onDraftChange({
      kind: "text",
      text: draft,
      script: detectScript(draft),
      selection: nextSelection,
    });
  }

  async function handleLeave() {
    if (!canWrite || isLeaving || trimmedDraft === "") return;
    props.onWritingChange(true);
    setIsLeaving(true);
    setFailure(undefined);
    const measure = await loadMeasure({ ...draftStyle, text: trimmedDraft });
    if (lockRef.current.kind === "taken") {
      props.onWritingChange(false);
      setIsLeaving(false);
      return;
    }
    const fit = fitEntry({
      text: trimmedDraft,
      maxWidthPx,
      measure,
      linesPerPage: notebook.linesPerPage,
    });
    if (!fit.fits) {
      setFailure({ kind: "rejected", reason: "invalid_line_count" });
      props.onWritingChange(false);
      setIsLeaving(false);
      return;
    }
    const placed = await leaveEntry({
      body: trimmedDraft,
      script: draftScript,
      lineCount: fit.lineCount,
    }).catch((): LeaveEntryFailure => ({ kind: "offline" }));
    setIsLeaving(false);
    if (placed.kind !== "placed") {
      setFailure(placed);
      props.onWritingChange(false);
      return;
    }
    setDraft("");
    writeStoredDraft("");
    await handlePlaced({
      placed,
      emptyDraft: {
        kind: "text",
        text: "",
        script: draftScript,
        selection: { start: 0, end: 0 },
      },
    });
  }

  async function handleLeaveDoodle() {
    if (!canWrite || !isPadVisible || isLeaving || strokes.length === 0) {
      return;
    }
    props.onWritingChange(true);
    setIsLeaving(true);
    setFailure(undefined);
    const placed = await leaveDoodle(
      encodeDoodle({ strokes, widthPx: maxWidthPx })
    ).catch((): LeaveEntryFailure => ({ kind: "offline" }));
    setIsLeaving(false);
    if (placed.kind !== "placed") {
      setFailure(placed);
      props.onWritingChange(false);
      return;
    }
    setStrokes([]);
    writeStoredDoodle({ strokes: [], widthPx: maxWidthPx });
    setMode("write");
    await handlePlaced({
      placed,
      emptyDraft: { kind: "text", text: "", script: draftScript },
    });
  }

  async function handlePlaced(options: {
    placed: PlacedEntry;
    emptyDraft: DraftContent;
  }) {
    const { placed } = options;
    props.onEntryPlaced({
      notebookNumber: placed.notebookNumber,
      entry: placed.entry,
    });
    setPlacedAt(storePlacedAtNow());
    props.onWritingChange(false);
    props.onDraftChange(options.emptyDraft);
    props.onPlaced();
    if (placed.notebookNumber !== notebook.number) {
      const isLatest = await reloadNotebook(undefined);
      if (isLatest) turns.setSpread(getSpreadOfPage(placed.entry.page));
    } else {
      setLocalEntries((entries) => [...entries, placed.entry]);
    }
    const canReplay =
      !props.reducedMotion &&
      (placed.entry.kind === "text" || quality === "full");
    setInk(
      canReplay ? { entryId: String(placed.entry.id), line: 0 } : undefined
    );
  }

  function updateStrokes(next: DoodleStroke[]) {
    setStrokes(next);
    setFailure(undefined);
    writeStoredDoodle({ strokes: next, widthPx: maxWidthPx });
    if (next.length > 0) props.onWritingChange(true);
    props.onDraftChange({
      kind: "doodle",
      drawing:
        next.length === 0
          ? undefined
          : encodeDoodle({ strokes: next, widthPx: maxWidthPx }),
    });
  }

  function handleStroke(stroke: DoodleStroke) {
    if (!canWrite || isLeaving || isInkFull) return;
    updateStrokes([
      ...strokes,
      {
        points: stroke.points.slice(0, DOODLE_LIMITS.maxPoints - pointCount),
        durationMs: Math.min(stroke.durationMs, DOODLE_LIMITS.maxStrokeMs),
      },
    ]);
  }

  function handleUndo() {
    if (!isLeaving && strokes.length > 0) updateStrokes(strokes.slice(0, -1));
  }

  function handleModeChange(next: PenMode) {
    if (!canWrite || isLeaving || next === mode) return;
    setMode(next);
    setFailure(undefined);
    if (next === "draw") {
      textareaRef.current?.blur();
      props.onDraftChange({
        kind: "doodle",
        drawing:
          strokes.length === 0
            ? undefined
            : encodeDoodle({ strokes, widthPx: maxWidthPx }),
      });
      return;
    }
    textareaRef.current?.focus({ preventScroll: true });
    props.onDraftChange({
      kind: "text",
      text: draft,
      script: detectScript(draft),
    });
  }

  const isPenKeysOn = phase === "open" && isWritable;
  useEffect(() => {
    if (!isPenKeysOn) return;
    function handlePenKey(event: KeyboardEvent) {
      if (event.defaultPrevented || !canWrite || isLeaving) return;
      const isOnControl =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLButtonElement;
      if (
        event.key === "Tab" &&
        event.shiftKey &&
        !event.isComposing &&
        !isOnControl
      ) {
        event.preventDefault();
        handleModeChange(mode === "draw" ? "write" : "draw");
        return;
      }
      if (mode !== "draw" || !(event.metaKey || event.ctrlKey)) return;
      if (event.key === "z" && !event.shiftKey && strokes.length > 0) {
        event.preventDefault();
        handleUndo();
      } else if (event.key === "Enter") {
        event.preventDefault();
        void handleLeaveDoodle();
      }
    }
    window.addEventListener("keydown", handlePenKey);
    return () => window.removeEventListener("keydown", handlePenKey);
  });

  const handleInkComplete = useCallback(
    (entryId: string) => {
      setInk((current) => {
        if (current === undefined || current.entryId !== entryId)
          return current;
        const entry = stored.find(({ fitted }) => fitted.id === entryId);
        const lineTotal = entry?.fitted.lines.length ?? 0;
        return current.line + 1 >= lineTotal
          ? undefined
          : { entryId, line: current.line + 1 };
      });
    },
    [stored]
  );

  async function handleReport(options: {
    entryId: number;
    reason: string | undefined;
  }) {
    setReportingEntryId(undefined);
    setReportedIds((ids) => [...ids, options.entryId]);
    await reportNotebookEntry(options).catch(() => ({ kind: "offline" }));
  }

  function readSelection(textarea: HTMLTextAreaElement) {
    const next = { start: textarea.selectionStart, end: textarea.selectionEnd };
    setSelection(next);
    return next;
  }

  function handleTextareaKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleLeave();
      return;
    }
    if (event.key === "Tab" && !event.shiftKey && canWrite) {
      event.preventDefault();
      const textarea = event.currentTarget;
      textarea.setRangeText(
        TAB_SPACES,
        textarea.selectionStart,
        textarea.selectionEnd,
        "end"
      );
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function handleJumpKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setIsJumping(false);
      return;
    }
    if (event.key !== "Enter") return;
    const page = Number.parseInt(event.currentTarget.value, 10);
    if (Number.isFinite(page) && page >= 1 && page <= notebook.pageCount) {
      goToSpread(getSpreadOfPage(page));
    }
    setIsJumping(false);
  }

  function handlePageClick() {
    const isSelectingText = window.getSelection()?.isCollapsed === false;
    if (canWrite && mode === "write" && !isSelectingText) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }

  const handleCurlUnsupported = useCallback(
    () => setIsCurlUnsupported(true),
    []
  );

  const isOpen = phase !== "closed";
  const isIdle = phase === "open" && turn === undefined;
  const pageControls = {
    onNumber: isIdle ? () => setIsJumping(true) : undefined,
    onReport: (entryId: number) => setReportingEntryId(entryId),
    reportedIds,
    onInkComplete: handleInkComplete,
    inkSpeed: details.inkSpeed,
    pad: {
      disabled: !canWrite || isLeaving || isInkFull,
      isEditable: canWrite && !isLeaving,
      onStrokeStart: () => props.onWritingChange(true),
      onStrokeCancel: () => {
        if (strokes.length === 0 && draft.trim() === "") {
          props.onWritingChange(false);
        }
      },
      onStroke: handleStroke,
      onScratch: (volume: number) => sound?.play("crayon-scratch", { volume }),
      onUndo: handleUndo,
      onClear: () => {
        if (!isLeaving) updateStrokes([]);
      },
    },
  };

  const staticLeft = (() => {
    if (turn === undefined) return spread * 2;
    if (turn.kind === "fade") return turn.to * 2;
    return Math.min(turn.from, turn.to) * 2;
  })();
  const staticRight = (() => {
    if (turn === undefined) return spread * 2 + 1;
    if (turn.kind === "turn") return Math.max(turn.from, turn.to) * 2 + 1;
    return turn.to * 2 + 1;
  })();
  const leafPages =
    turn?.kind === "turn"
      ? {
          front: Math.min(turn.from, turn.to) * 2 + 1,
          back: Math.max(turn.from, turn.to) * 2,
        }
      : undefined;
  const curlTurn: CurlTurn | undefined =
    turn?.kind !== "turn" || leafPages === undefined || curlMode === "css"
      ? undefined
      : {
          front: getPageSpec(leafPages.front),
          back: getPageSpec(leafPages.back),
          grab: turn.grab,
        };

  function renderPage(options: {
    page: number;
    side: "left" | "right";
    isInteractive: boolean;
  }) {
    const spec = getPageSpec(options.page);
    const canTurn = options.isInteractive && isIdle;
    const turnTarget = (() => {
      if (!canTurn) return undefined;
      if (options.side === "left" && spread > 0) return spread - 1;
      if (options.side === "right" && spread < lastSpread) return spread + 1;
      return undefined;
    })();
    return (
      <NotebookPage
        content={spec.content}
        side={options.side}
        settings={settings}
        pitch={pitch}
        rows={spec.rows}
        doodles={spec.doodles}
        pad={spec.pad}
        doodle={doodle}
        remoteCaret={getRemoteCaret(spec.rows)}
        controls={
          options.isInteractive
            ? {
                ...pageControls,
                edge:
                  turnTarget === undefined
                    ? undefined
                    : {
                        onClick: () => goToSpread(turnTarget),
                        onPointerDown: (event) =>
                          handleEdgePointerDown(event, {
                            to: turnTarget,
                            side: options.side,
                          }),
                      },
              }
            : undefined
        }
      />
    );
  }

  const statusMessage = (() => {
    if (failure !== undefined) return describeLeaveFailure({ failure, copy });
    if (result === undefined || !isContentReady) return copy.notebook.opening;
    if (result.kind === "offline") {
      return copy.notebook.leaveFailures.offline;
    }
    if (result.kind === "missing")
      return copy.notebook.missing({
        number: props.bookNumber ?? notebook.number,
      });
    if (!isWritable) return copy.notebook.full({ number: notebook.number });
    if (placedAt !== undefined) return copy.notebook.comeBackToWrite;
    if (props.lock.kind === "joining") return copy.notebook.opening;
    if (props.lock.kind === "taken") {
      if (shownMode === "draw") return copy.notebook.someoneDrawingInNotebook;
      return trimmedDraft === ""
        ? copy.notebook.someoneWritingInNotebook
        : copy.notebook.someoneWriting;
    }
    if (mode === "draw") {
      if (doodlePlacement.startsNewBook) return copy.notebook.doodleBookFull;
      if (isInkFull) return copy.notebook.inkFull;
      if (doodlePlacement.isMoved) {
        return copy.notebook.doodleMoved({ page: doodlePlacement.page });
      }
      return copy.notebook.drawPrompt;
    }
    if (draftPlacement.startsNewBook) {
      return copy.notebook.startsNext({ number: notebook.number + 1 });
    }
    if (
      draft.length >=
      config.notebook.maxChars * config.notebook.counterFromRatio
    ) {
      return `${draft.length} / ${config.notebook.maxChars}`;
    }
    return undefined;
  })();
  const statusText = statusMessage ?? (
    <>
      {copy.notebook.writePromptBeforeKeys}
      <ShortcutHint keys={["mod", "↵"]} label={undefined} />
      {copy.notebook.writePromptAfterKeys}
    </>
  );
  const penHints =
    canWrite && failure === undefined && isContentReady
      ? mode === "draw"
        ? [
            { keys: ["mod", "z"], label: copy.notebook.undo },
            { keys: ["⇧", "tab"], label: copy.notebook.penModes.write },
          ]
        : [{ keys: ["⇧", "tab"], label: copy.notebook.penModes.draw }]
      : [];

  const isSaveDisabled =
    isLeaving ||
    (mode === "draw"
      ? strokes.length === 0 || !isPadVisible
      : trimmedDraft === "" || !draftFit.fits);

  function handleSave() {
    void (mode === "draw" ? handleLeaveDoodle() : handleLeave());
  }

  const jumpField = isJumping ? (
    <label className="flex items-center gap-x-2 lowercase">
      {copy.notebook.goToPage}
      <input
        autoFocus
        type="number"
        inputMode="numeric"
        min={1}
        max={notebook.pageCount}
        aria-label={copy.notebook.pageInputLabel({
          pageCount: notebook.pageCount,
        })}
        onKeyDown={handleJumpKeyDown}
        onBlur={() => setIsJumping(false)}
        className="w-14 rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-2 py-1 text-[var(--lm-ink-hi)] tabular-nums outline-none focus-visible:border-[var(--lm-accent)]"
      />
    </label>
  ) : null;

  const width = settings.width * 2;
  const height = settings.height;

  return (
    <div
      data-notebook
      role="dialog"
      aria-label={copy.notebook.dialogLabel({ number: notebook.number })}
      className="relative select-none"
      style={{ width, height: height + config.notebook.statusBarPx }}
    >
      <div
        ref={bookRef}
        data-lm-text={canWrite && mode === "write" ? "" : undefined}
        className="relative z-10 [perspective:2600px]"
        style={{ width, height }}
        onClick={handlePageClick}
      >
        <motion.div
          className="relative size-full [transform-style:preserve-3d]"
          initial={false}
          animate={{ x: isOpen ? 0 : -settings.width / 2 }}
          transition={{
            duration: props.reducedMotion ? 0 : details.coverOpenMs / 1000,
            ease: config.camera.ease,
          }}
        >
          {isOpen && (
            <motion.div
              key={turn?.kind === "fade" ? `fade-${turn.to}` : "pages"}
              className="absolute inset-0"
              initial={turn?.kind === "fade" ? { opacity: 0.4 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: FADE_MS / 1000 }}
            >
              <div
                className={cn(
                  "absolute top-0 left-0 h-full overflow-hidden transition-opacity duration-500",
                  isSinglePage && padSide !== "left" && "opacity-0"
                )}
                style={{ width: settings.width }}
              >
                {renderPage({
                  page: staticLeft,
                  side: "left",
                  isInteractive: turn === undefined,
                })}
              </div>
              <div
                className={cn(
                  "absolute top-0 h-full overflow-hidden transition-opacity duration-500",
                  isSinglePage && padSide !== "right" && "opacity-0"
                )}
                style={{ left: settings.width, width: settings.width }}
              >
                {renderPage({
                  page: staticRight,
                  side: "right",
                  isInteractive: turn === undefined,
                })}
              </div>
            </motion.div>
          )}
          {!isOpen && (
            <div
              className="absolute top-0 h-full bg-[var(--lm-paper)]"
              style={{
                left: settings.width,
                width: settings.width,
                borderRadius: getPageRadius("right"),
              }}
            >
              {renderPage({ page: 1, side: "right", isInteractive: false })}
            </div>
          )}
          {leafPages !== undefined && (
            <PageLeaf
              angle={leafAngle}
              curlStrength={details.curlStrength}
              pageWidth={settings.width}
              hidden={curlMode === "webgl"}
              front={renderPage({
                page: leafPages.front,
                side: "right",
                isInteractive: false,
              })}
              back={renderPage({
                page: leafPages.back,
                side: "left",
                isInteractive: false,
              })}
            />
          )}
          {turn?.kind === "riffle" &&
            Array.from({ length: details.riffleSheets }, (_, index) => (
              <div
                key={index}
                aria-hidden
                className="absolute top-0 h-full origin-left bg-[var(--lm-paper)] shadow-[inset_18px_0_24px_-20px_rgb(0_0_0/0.35)] [backface-visibility:visible]"
                style={{
                  left: settings.width,
                  width: settings.width,
                  borderRadius: getPageRadius("right"),
                  animation: `${turn.to > turn.from ? "lm-riffle-forward" : "lm-riffle-back"} ${details.riffleSheetMs}ms cubic-bezier(0.45, 0.05, 0.3, 1) ${index * details.riffleStaggerMs}ms both`,
                }}
              />
            ))}
          <motion.div
            aria-hidden
            className={cn(
              "absolute top-0 h-full origin-left [transform-style:preserve-3d]",
              phase === "open" && "invisible"
            )}
            style={{ left: settings.width, width: settings.width }}
            initial={false}
            animate={{ rotateY: isOpen ? -180 : coverWaitDeg }}
            transition={{
              duration: props.reducedMotion ? 0 : details.coverOpenMs / 1000,
              ease: details.turnEase,
            }}
          >
            <motion.div
              className="absolute inset-0 origin-left [transform-style:preserve-3d]"
              initial={false}
              animate={{
                rotateY: isCoverBreathing ? [0, -details.coverBreathDeg] : 0,
              }}
              transition={
                isCoverBreathing
                  ? {
                      duration: details.coverBreathMs / 1000,
                      delay: details.coverOpenMs / 1000,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    }
                  : { duration: details.coverOpenMs / 1000, ease: "easeOut" }
              }
            >
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <NotebookPage
                  content={{ kind: "cover", number: notebook.number }}
                  side="right"
                  settings={settings}
                  pitch={pitch}
                  rows={[]}
                  doodles={[]}
                  pad={undefined}
                  doodle={doodle}
                  remoteCaret={undefined}
                  controls={undefined}
                />
              </div>
              <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                {renderPage({ page: 0, side: "left", isInteractive: false })}
              </div>
            </motion.div>
          </motion.div>
          {curlMode === "webgl" && !props.reducedMotion && (
            <PageCurlCanvas
              turn={curlTurn}
              progress={turns.progress}
              settings={settings}
              pitch={pitch}
              strokeWidthPx={doodle.strokeWidthPx}
              curlStrength={details.curlStrength}
              onUnsupported={handleCurlUnsupported}
            />
          )}
        </motion.div>
      </div>
      <style>{`
@keyframes lm-riffle-forward { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
@keyframes lm-riffle-back { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
@keyframes lm-caret { 50% { opacity: 0; } }
@keyframes lm-doodle-ink { from { opacity: 1; } to { stroke-dashoffset: 0; opacity: 1; } }
@keyframes lm-doodle-dot { to { opacity: 1; } }
`}</style>
      {isWritable && (
        <textarea
          readOnly={!canWrite}
          ref={textareaRef}
          aria-label={copy.notebook.textareaLabel}
          className="sr-only caret-transparent"
          value={draft}
          maxLength={config.notebook.maxChars}
          onChange={handleDraftChange}
          onKeyDown={handleTextareaKeyDown}
          onSelect={(event) => handleSelect(event.currentTarget)}
          onFocus={(event) => handleSelect(event.currentTarget)}
        />
      )}
      <div
        className={cn(
          "absolute bottom-0 flex flex-col justify-start gap-y-1 px-2 text-[12px] text-[var(--lm-ink)] transition-opacity duration-300",
          isLifted ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: config.notebook.statusBarPx,
          left: isSinglePage && padSide === "right" ? settings.width : 0,
          width: isSinglePage ? settings.width : width,
        }}
      >
        <div
          className={cn(
            "transition-opacity duration-300",
            phase !== "open" && "opacity-0",
            isSinglePage && "hidden"
          )}
        >
          <PageScrubber
            spread={spread}
            spreadCount={lastSpread + 1}
            pageCount={notebook.pageCount}
            inkedSpreads={inkedSpreads}
            disabled={phase !== "open"}
            onSelect={goToSpread}
          />
        </div>
        {isNarrowScreen ? (
          <div className="flex justify-end">{jumpField}</div>
        ) : (
          <div className="flex items-center justify-between gap-x-4">
            <div className="flex min-w-0 items-center gap-x-4 opacity-70">
              <p role="status" className="truncate lowercase">
                {statusText}
              </p>
              {penHints.length > 0 && (
                <span className="flex shrink-0 items-center gap-x-3 lowercase [@media(pointer:coarse)]:hidden">
                  {penHints.map((hint) => (
                    <ShortcutHint
                      key={hint.label}
                      keys={hint.keys}
                      label={hint.label}
                    />
                  ))}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-x-2">
              {jumpField}
              {isWritable &&
                props.lock.kind === "taken" &&
                placedAt === undefined && (
                  <button
                    type="button"
                    disabled={props.freeNoticeOn}
                    onClick={props.onRequestFreeNotice}
                    className="cursor-pointer rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-3 py-1.5 text-[var(--lm-ink-hi)] lowercase transition-opacity outline-none hover:border-[var(--lm-accent)] focus-visible:border-[var(--lm-accent)] disabled:cursor-default disabled:opacity-60"
                  >
                    {props.freeNoticeOn
                      ? copy.notebook.notifyPending
                      : copy.notebook.notifyWhenFree}
                  </button>
                )}
              {canWrite && (
                <div
                  role="group"
                  aria-label={copy.notebook.penModeLabel}
                  className="flex rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] p-0.5"
                >
                  {(["write", "draw"] satisfies PenMode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => handleModeChange(option)}
                      className={cn(
                        "cursor-pointer rounded-[5px] px-2.5 py-1 lowercase outline-none focus-visible:text-[var(--lm-ink-hi)]",
                        mode === option
                          ? "bg-[var(--lm-edge)] text-[var(--lm-ink-hi)]"
                          : "text-[var(--lm-ink)] hover:text-[var(--lm-ink-hi)]"
                      )}
                    >
                      {copy.notebook.penModes[option]}
                    </button>
                  ))}
                </div>
              )}
              {canWrite && (
                <button
                  type="button"
                  disabled={isSaveDisabled}
                  onClick={handleSave}
                  className="cursor-pointer rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-3 py-1.5 text-[var(--lm-ink-hi)] lowercase transition-opacity outline-none hover:border-[var(--lm-accent)] focus-visible:border-[var(--lm-accent)] disabled:cursor-default disabled:opacity-40"
                >
                  {isLeaving ? (
                    copy.notebook.savingNote
                  ) : (
                    <span className="flex items-center gap-x-2">
                      {mode === "draw"
                        ? copy.notebook.saveDoodle
                        : copy.notebook.saveNote}
                      <span className="contents [@media(pointer:coarse)]:hidden">
                        <ShortcutHint keys={["mod", "↵"]} label={undefined} />
                      </span>
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={props.onClose}
                className="cursor-pointer rounded-md px-3 py-1.5 text-[var(--lm-ink)] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)]"
              >
                {copy.notebook.close}
              </button>
            </div>
          </div>
        )}
      </div>
      {reportingEntryId !== undefined && (
        <ReportEntryDialog
          onCancel={() => setReportingEntryId(undefined)}
          onConfirm={(reason) =>
            void handleReport({ entryId: reportingEntryId, reason })
          }
        />
      )}
      {isNarrowScreen && isLifted && (
        <NotebookPhoneBar
          status={statusMessage ?? copy.notebook.writePrompt}
          pen={
            canWrite
              ? {
                  mode,
                  disabled: isLeaving,
                  label: copy.notebook.penModeLabel,
                  modeLabels: copy.notebook.penModes,
                  onModeChange: handleModeChange,
                }
              : undefined
          }
          notify={
            isWritable && props.lock.kind === "taken" && placedAt === undefined
              ? {
                  label: props.freeNoticeOn
                    ? copy.notebook.notifyPending
                    : copy.notebook.notifyWhenFree,
                  disabled: props.freeNoticeOn,
                  onPress: props.onRequestFreeNotice,
                }
              : undefined
          }
          undo={
            canWrite && mode === "draw"
              ? {
                  label: copy.notebook.undo,
                  disabled: strokes.length === 0 || isLeaving,
                  onPress: handleUndo,
                }
              : undefined
          }
          save={
            canWrite
              ? {
                  label:
                    mode === "draw"
                      ? copy.notebook.saveDoodle
                      : copy.notebook.saveNote,
                  disabled: isSaveDisabled,
                  busy: isLeaving,
                  onPress: handleSave,
                }
              : undefined
          }
          close={{ label: copy.notebook.close, onPress: props.onClose }}
        />
      )}
    </div>
  );
}
