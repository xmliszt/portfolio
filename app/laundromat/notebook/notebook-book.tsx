"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uniq } from "lodash";
import { motion, useTransform } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { describeEntryMeta } from "@/lib/laundromat/notebook/describe-entry-meta";
import type { LeaveEntryFailure } from "@/lib/laundromat/notebook/describe-leave-failure";
import { describeLeaveFailure } from "@/lib/laundromat/notebook/describe-leave-failure";
import { detectScript } from "@/lib/laundromat/notebook/detect-script";
import { fitEntry } from "@/lib/laundromat/notebook/fit-entry";
import { formatEntryDay } from "@/lib/laundromat/notebook/format-entry-day";
import { getDraftPlacement } from "@/lib/laundromat/notebook/get-draft-placement";
import { getEntrySpreads } from "@/lib/laundromat/notebook/get-entry-spreads";
import { getSpreadOfPage } from "@/lib/laundromat/notebook/get-spread-of-page";
import { isRtlScript } from "@/lib/laundromat/notebook/is-rtl-script";
import { keepTrailingSpace } from "@/lib/laundromat/notebook/keep-trailing-space";
import type { FittedEntry } from "@/lib/laundromat/notebook/layout-page-rows";
import { layoutPageRows } from "@/lib/laundromat/notebook/layout-page-rows";
import { wrapEntryText } from "@/lib/laundromat/notebook/wrap-entry-text";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";
import { cn } from "@/lib/utils";

import { HANDWRITING_FONT_FAMILIES } from "./handwriting-fonts";
import type { NotebookResult, NotebookView } from "./notebook-actions";
import {
  leaveEntry,
  loadNotebook,
  reportNotebookEntry,
} from "./notebook-actions";
import type { NotebookLock } from "./notebook-lock";
import type { PageContent, RowView } from "./notebook-page";
import { NotebookPage } from "./notebook-page";
import type { CurlTurn } from "./page-curl-canvas";
import { PageCurlCanvas } from "./page-curl-canvas";
import { PageLeaf } from "./page-leaf";
import { PageScrubber } from "./page-scrubber";
import type { PageSpec } from "./paint-page-texture";
import { ShortcutKeys } from "./shortcut-keys";
import { useBookTurns } from "./use-book-turns";
import { useTextMeasurers } from "./use-text-measurers";

const DRAFT_STORAGE_KEY = "laundromat:notebook-draft";
const DRAFT_ID = "draft";
const FADE_MS = 220;
const WRITING_IDLE_RELEASE_MS = 90_000;
const TAB_SPACES = "    ";

type BookPhase = "closed" | "opening" | "open";

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
  onPlaced: () => void;
  onClose: () => void;
  lock: NotebookLock;
  freeNoticeOn: boolean;
  onWritingChange: (isWriting: boolean) => void;
  onDraftChange: (draft: { text: string; script: NotebookScript }) => void;
  onRequestFreeNotice: () => void;
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

function writeStoredDraft(value: string) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, value);
  } catch {
    return;
  }
}

export function NotebookBook(props: NotebookBookProps) {
  const { copy } = useLaundromatCopy();
  const { config } = props;
  const settings = config.notebook.page;
  const details = config.details.notebook;
  const isWritable = props.bookNumber === undefined;
  const [isReloading, setIsReloading] = useState(true);
  const canWrite = isWritable && props.lock.kind === "free" && !isReloading;

  const [result, setResult] = useState<NotebookResult>();
  const [phase, setPhase] = useState<BookPhase>("closed");
  const [draft, setDraft] = useState("");
  const [failure, setFailure] = useState<LeaveEntryFailure>();
  const [isLeaving, setIsLeaving] = useState(false);
  const [ink, setInk] = useState<{ entryId: string; line: number }>();
  const [reportedIds, setReportedIds] = useState<number[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [curlMode, setCurlMode] = useState<"webgl" | "css">("webgl");
  const [localEntries, setLocalEntries] = useState<NotebookView["entries"]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  const { spread, turn, goToSpread } = turns;
  const sound = useSoundBoard();

  useEffect(() => {
    if (turn === undefined || turn.kind === "fade") return;
    if (turn.kind === "turn") {
      sound?.play("page-flip");
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
      if (
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement ||
        (target instanceof HTMLElement && target.isContentEditable)
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
      const style = getEntryStyle({
        script: entry.script,
        reportEntryId: entry.body === "" ? undefined : entry.id,
      });
      const isHidden = entry.body === "";
      const fitted: FittedEntry = {
        id: String(entry.id),
        page: entry.page,
        lineStart: entry.lineStart,
        lineCount: entry.lineCount,
        lines: isHidden
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

  const remoteDraft =
    props.lock.kind === "taken" ? props.lock.draft : undefined;
  const pageDraft =
    props.lock.kind === "taken" ? (remoteDraft?.text ?? "") : draft;
  const trimmedDraft = pageDraft.trimEnd();
  const draftScript = remoteDraft?.script ?? detectScript(trimmedDraft);
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
  const shownDraftFit = fitEntry({
    text: pageDraft,
    maxWidthPx,
    measure: getMeasure(draftStyle),
    linesPerPage: notebook.linesPerPage,
  });
  const shownDraftLines = keepTrailingSpace({
    lines: shownDraftFit.lines,
    text: pageDraft,
    maxWidthPx,
    measure: getMeasure(draftStyle),
  });
  const draftPlacement = getDraftPlacement({
    linesUsed: notebook.linesUsed,
    lineCount: Math.max(2, shownDraftFit.lineCount),
    linesPerPage: notebook.linesPerPage,
    pageCount: notebook.pageCount,
  });
  const writeSpread = getSpreadOfPage(draftPlacement.caretPage);
  const isDraftVisible =
    isWritable &&
    !draftPlacement.startsNewBook &&
    (canWrite || trimmedDraft !== "");
  const draftEntry: FittedEntry | undefined = isDraftVisible
    ? {
        id: DRAFT_ID,
        page: draftPlacement.page,
        lineStart: draftPlacement.lineStart,
        lineCount: Math.max(1, shownDraftLines.length),
        lines: shownDraftLines.length === 0 ? [""] : shownDraftLines,
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
    if (content.kind !== "paper") return { content, rows: [] };
    const rows = layoutPageRows({
      entries: fittedEntries,
      page,
      linesPerPage: notebook.linesPerPage,
    }).flatMap((row): RowView[] => {
      const style = styles[row.entryId];
      if (style === undefined) return [];
      const isDraft = row.entryId === DRAFT_ID;
      return [
        {
          ...row,
          ...style,
          ink: getInkState(row),
          hasCaret: isDraft && row.isLastTextRow && phase === "open",
        },
      ];
    });
    return { content, rows };
  }

  useEffect(() => {
    setDraft(readStoredDraft());
  }, []);

  const loadRequestRef = useRef(0);
  const reloadNotebook = useCallback(async (bookNumber: number | undefined) => {
    loadRequestRef.current += 1;
    const request = loadRequestRef.current;
    setIsReloading(true);
    const next = await loadNotebook(bookNumber).catch(
      (): NotebookResult => ({ kind: "offline" })
    );
    if (request !== loadRequestRef.current) return false;
    setIsReloading(false);
    if (next.kind === "offline") {
      setResult((current) => (current?.kind === "online" ? current : next));
      return true;
    }
    setResult(next);
    setLocalEntries([]);
    return true;
  }, []);

  useEffect(() => {
    void reloadNotebook(props.bookNumber);
    return () => {
      loadRequestRef.current += 1;
    };
  }, [props.bookNumber, reloadNotebook]);

  useEffect(() => {
    if (props.reducedMotion) {
      setPhase("open");
      return;
    }
    const openTimer = window.setTimeout(
      () => setPhase("opening"),
      details.liftMs
    );
    const doneTimer = window.setTimeout(
      () => setPhase("open"),
      details.liftMs + details.coverOpenMs
    );
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
    };
  }, [props.reducedMotion, details.liftMs, details.coverOpenMs]);

  const hasArrivedRef = useRef(false);
  useEffect(() => {
    if (phase !== "open" || result === undefined || hasArrivedRef.current) {
      return;
    }
    hasArrivedRef.current = true;
    const target = isWritable ? writeSpread : 0;
    if (target !== spread) goToSpread(target);
    if (canWrite) textareaRef.current?.focus({ preventScroll: true });
  }, [phase, result, isWritable, canWrite, writeSpread, spread, goToSpread]);

  const { onWritingChange } = props;
  const lockRef = useRef(props.lock);
  useEffect(() => {
    lockRef.current = props.lock;
  }, [props.lock]);

  const { bookNumber, onPlaced } = props;
  const isTaken = props.lock.kind === "taken";
  const wasTakenRef = useRef(isTaken);
  useEffect(() => {
    const wasTaken = wasTakenRef.current;
    wasTakenRef.current = isTaken;
    if (!isWritable || !wasTaken || isTaken) return;
    void reloadNotebook(bookNumber).then((isLatest) => {
      if (isLatest) onPlaced();
    });
  }, [isWritable, isTaken, bookNumber, onPlaced, reloadNotebook]);

  useEffect(() => {
    if (isTaken) onWritingChange(false);
  }, [isTaken, onWritingChange]);
  useEffect(() => {
    if (!canWrite || draft.trim() === "") return;
    const timeout = window.setTimeout(
      () => onWritingChange(false),
      WRITING_IDLE_RELEASE_MS
    );
    return () => window.clearTimeout(timeout);
  }, [canWrite, draft, onWritingChange]);

  useEffect(() => () => onWritingChange(false), [onWritingChange]);

  const lastDraftRef = useRef(pageDraft);
  useEffect(() => {
    const didDraftChange = lastDraftRef.current !== pageDraft;
    lastDraftRef.current = pageDraft;
    if (!didDraftChange || !hasArrivedRef.current || !isDraftVisible) return;
    if (writeSpread !== spread) goToSpread(writeSpread);
  }, [pageDraft, writeSpread, spread, goToSpread, isDraftVisible]);

  function handleDraftChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value.slice(0, config.notebook.maxChars);
    setDraft(next);
    setFailure(undefined);
    writeStoredDraft(next);
    props.onWritingChange(next.trim() !== "");
    props.onDraftChange({ text: next, script: detectScript(next) });
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
    props.onWritingChange(false);
    props.onDraftChange({ text: "", script: draftScript });
    props.onPlaced();
    if (placed.notebookNumber !== notebook.number) {
      const isLatest = await reloadNotebook(undefined);
      if (isLatest) turns.setSpread(getSpreadOfPage(placed.entry.page));
    } else {
      setLocalEntries((entries) => [...entries, placed.entry]);
    }
    setInk(
      props.reducedMotion
        ? undefined
        : { entryId: String(placed.entry.id), line: 0 }
    );
  }

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

  async function handleReport(entryId: number) {
    setReportedIds((ids) => [...ids, entryId]);
    await reportNotebookEntry(entryId).catch(() => ({ kind: "offline" }));
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
    if (canWrite) textareaRef.current?.focus({ preventScroll: true });
  }

  const handleCurlUnsupported = useCallback(() => setCurlMode("css"), []);

  const isOpen = phase !== "closed";
  const isIdle = phase === "open" && turn === undefined;
  const pageControls = {
    onNumber: isIdle ? () => setIsJumping(true) : undefined,
    onReport: (entryId: number) => void handleReport(entryId),
    reportedIds,
    onInkComplete: handleInkComplete,
    inkSpeed: details.inkSpeed,
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
    leafPages === undefined || curlMode === "css"
      ? undefined
      : {
          front: getPageSpec(leafPages.front),
          back: getPageSpec(leafPages.back),
        };

  function renderPage(options: {
    page: number;
    side: "left" | "right";
    isInteractive: boolean;
  }) {
    const spec = getPageSpec(options.page);
    const canTurn = options.isInteractive && isIdle;
    return (
      <NotebookPage
        content={spec.content}
        side={options.side}
        settings={settings}
        pitch={pitch}
        rows={spec.rows}
        controls={
          options.isInteractive
            ? {
                ...pageControls,
                onCorner: !canTurn
                  ? undefined
                  : options.side === "left" && spread > 0
                    ? () => goToSpread(spread - 1)
                    : options.side === "right" && spread < lastSpread
                      ? () => goToSpread(spread + 1)
                      : undefined,
              }
            : undefined
        }
      />
    );
  }

  const statusText = (() => {
    if (failure !== undefined) return describeLeaveFailure({ failure, copy });
    if (result === undefined) return copy.notebook.opening;
    if (result.kind === "offline") {
      return copy.notebook.leaveFailures.offline;
    }
    if (result.kind === "missing")
      return copy.notebook.missing({
        number: props.bookNumber ?? notebook.number,
      });
    if (!isWritable) return copy.notebook.full({ number: notebook.number });
    if (props.lock.kind === "taken") {
      return trimmedDraft === ""
        ? copy.notebook.someoneWritingInNotebook
        : copy.notebook.someoneWriting;
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
    return (
      <>
        {copy.notebook.writePromptBeforeKeys}
        <ShortcutKeys />
        {copy.notebook.writePromptAfterKeys}
      </>
    );
  })();

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
        data-lm-text={canWrite ? "" : undefined}
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
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: settings.width }}
              >
                {renderPage({
                  page: staticLeft,
                  side: "left",
                  isInteractive: turn === undefined,
                })}
              </div>
              <div
                className="absolute top-0 h-full overflow-hidden"
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
              style={{ left: settings.width, width: settings.width }}
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
            animate={{ rotateY: isOpen ? -180 : 0 }}
            transition={{
              duration: props.reducedMotion ? 0 : details.coverOpenMs / 1000,
              ease: details.turnEase,
            }}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <NotebookPage
                content={{ kind: "cover", number: notebook.number }}
                side="right"
                settings={settings}
                pitch={pitch}
                rows={[]}
                controls={undefined}
              />
            </div>
            <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              {renderPage({ page: 0, side: "left", isInteractive: false })}
            </div>
          </motion.div>
          {curlMode === "webgl" && !props.reducedMotion && (
            <PageCurlCanvas
              turn={curlTurn}
              progress={turns.progress}
              settings={settings}
              pitch={pitch}
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
        />
      )}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col justify-start gap-y-1 px-2 text-[12px] text-[var(--lm-ink)] transition-opacity duration-300",
          phase === "open" ? "opacity-100" : "opacity-0"
        )}
        style={{ height: config.notebook.statusBarPx }}
      >
        <PageScrubber
          spread={spread}
          spreadCount={lastSpread + 1}
          pageCount={notebook.pageCount}
          inkedSpreads={inkedSpreads}
          disabled={phase !== "open"}
          onSelect={goToSpread}
        />
        <div className="flex items-center justify-between gap-x-4">
          <p role="status" className="truncate lowercase opacity-70">
            {statusText}
          </p>
          <div className="flex shrink-0 items-center gap-x-2">
            {isJumping ? (
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
            ) : null}
            {isWritable && props.lock.kind === "taken" && (
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
              <button
                type="button"
                disabled={isLeaving || trimmedDraft === "" || !draftFit.fits}
                onClick={() => void handleLeave()}
                className="cursor-pointer rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-3 py-1.5 text-[var(--lm-ink-hi)] lowercase transition-opacity outline-none hover:border-[var(--lm-accent)] focus-visible:border-[var(--lm-accent)] disabled:cursor-default disabled:opacity-40"
              >
                {isLeaving ? copy.notebook.savingNote : copy.notebook.saveNote}
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
      </div>
    </div>
  );
}
