"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { HANDWRITING_FONT_FAMILIES } from "@/app/laundromat/notebook/handwriting-fonts";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { SHARE_TARGET_ICON_PATHS } from "@/components/instant-camera/share-target-icon-paths";
import { usePolaroidShare } from "@/components/instant-camera/use-polaroid-share";
import { useViewportSize } from "@/components/instant-camera/use-viewport-size";
import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { getNoteFontScale } from "@/lib/laundromat/instant-camera/get-note-font-scale";
import { getPolaroidMetrics } from "@/lib/laundromat/instant-camera/get-polaroid-metrics";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { SHARE_TARGETS } from "@/lib/laundromat/instant-camera/share-targets";
import { splitGraphemes } from "@/lib/laundromat/instant-camera/split-graphemes";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { detectScript } from "@/lib/laundromat/notebook/detect-script";
import { cn } from "@/lib/utils";

import { ShareHandoff } from "./share-handoff";

const NOTE_FOCUS_DELAY_MS = 700;
const UNDEVELOPED_FILTER =
  "brightness(0.25) sepia(0.6) contrast(0.6) saturate(0.2)";
const DEVELOPED_FILTER = "brightness(1) sepia(0) contrast(1) saturate(1)";
const SHARE_BUTTON_CLASS =
  "group relative grid size-10 cursor-pointer place-items-center bg-transparent text-[var(--lm-ink)] transition-[color,translate] duration-150 outline-none hover:-translate-y-0.5 hover:text-[var(--lm-ink-hi)] focus-visible:-translate-y-0.5 focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed disabled:cursor-default disabled:opacity-40";
const SHARE_TIP_CLASS =
  "pointer-events-none absolute top-full left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap text-[var(--lm-ink)] lowercase opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100";
const ACTION_CLASS =
  "cursor-pointer bg-transparent text-[10px] text-[var(--lm-ink)] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed";

export type Photo = {
  url: string;
  orientation: ViewfinderOrientation;
  tiltDeg: number;
};

type PolaroidSheetProps = {
  photo: Photo;
  onRetake: () => void;
  onDone: () => void;
};

/** Show the developed polaroid with a note to write on it, the platforms to share it to, and buttons to retake, copy or close it. */
export function PolaroidSheet(props: PolaroidSheetProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.instantCamera;
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const viewport = useViewportSize();
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shownNote = note === "" ? text.notePlaceholder : note;
  const noteFont = HANDWRITING_FONT_FAMILIES[detectScript(shownNote)];
  const stampDate = new Intl.DateTimeFormat(copy.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date());
  const longPx = (() => {
    if (viewport === undefined) return 380;
    const room = Math.min(viewport.width - 40, 520);
    return props.photo.orientation === "portrait"
      ? Math.min(380, room / 0.86, viewport.height * 0.55)
      : Math.min(460, room / 1.11, viewport.height * 0.6);
  })();
  const metrics = getPolaroidMetrics({
    orientation: props.photo.orientation,
    longPx,
  });
  const notePx = Math.round(metrics.notePx * getNoteFontScale(shownNote));
  const trimmedNote = note.trim();
  const shareText =
    trimmedNote === "" ? text.shareText : `${trimmedNote}\n\n${text.shareText}`;
  const share = usePolaroidShare({
    photo: props.photo,
    note,
    readPrintLook: () => {
      const card = cardRef.current;
      const stamp = stampRef.current;
      const noteElement = noteRef.current;
      return {
        noteFont,
        stampFont:
          stamp === null ? "monospace" : getComputedStyle(stamp).fontFamily,
        stamp: { left: new URL(LAUNDROMAT_ORIGIN).host, right: stampDate },
        colors: {
          paper:
            card === null ? "#e4dfd4" : getComputedStyle(card).backgroundColor,
          ink:
            noteElement === null
              ? "#2a2b2e"
              : getComputedStyle(noteElement).color,
          stamp: stamp === null ? "#9a958a" : getComputedStyle(stamp).color,
        },
      };
    },
    shareText,
    sheetText: shareText,
    siteUrl: LAUNDROMAT_ORIGIN,
    fileNames: {
      print: INSTANT_CAMERA.printFileName,
      shared: INSTANT_CAMERA.sharedFileName,
    },
    messages: {
      copied: text.copied,
      copyFailed: text.copyFailed,
      downloaded: text.downloaded,
      printFailed: text.snapFailed,
      mastodonAsk: text.mastodon.ask,
      pasteReminder: text.handoff.pasteReminder,
      savedReminder: text.handoff.savedReminder,
    },
  });
  const { toast, handoff } = share;

  useEffect(() => {
    const content = contentRef.current;
    if (content === null) return;
    content.inert = handoff !== undefined;
    return () => {
      content.inert = false;
    };
  }, [handoff]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => noteRef.current?.focus({ preventScroll: true }),
      NOTE_FOCUS_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, []);

  function handleNoteChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const element = event.currentTarget;
    element.value = splitGraphemes(element.value.replace(/\n/g, " "))
      .slice(0, INSTANT_CAMERA.noteMaxChars)
      .join("");
    while (
      element.value.length > 0 &&
      element.scrollHeight > element.clientHeight
    ) {
      element.value = splitGraphemes(element.value).slice(0, -1).join("");
    }
    setNote(element.value);
  }

  const developMs = INSTANT_CAMERA.developMs[quality];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={text.cardLabel}
      className="fixed inset-0 z-[410] flex flex-col items-center overflow-y-auto bg-[rgba(8,9,10,0.9)] px-[max(1rem,env(safe-area-inset-left))] pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && handoff === undefined) props.onDone();
      }}
    >
      <div
        ref={contentRef}
        className="my-auto flex w-full flex-col items-center gap-y-6"
      >
        <motion.div
          ref={cardRef}
          className="flex max-w-full flex-col bg-[var(--lm-paper)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_18px_40px_rgba(0,0,0,0.55),0_2px_6px_rgba(0,0,0,0.4)]"
          style={{ padding: `${metrics.border}px ${metrics.border}px 0` }}
          initial={
            prefersReducedMotion
              ? false
              : { y: 30, rotate: props.photo.tiltDeg }
          }
          animate={{ y: 0, rotate: props.photo.tiltDeg }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div
            className="relative overflow-hidden bg-[var(--lm-recess)] after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]"
            style={{ width: metrics.photoWidth, height: metrics.photoHeight }}
          >
            <motion.img
              src={props.photo.url}
              alt={text.photoAlt}
              className="block size-full object-cover"
              initial={
                prefersReducedMotion
                  ? false
                  : quality === "full"
                    ? { filter: UNDEVELOPED_FILTER }
                    : { opacity: 0 }
              }
              animate={
                quality === "full"
                  ? { filter: DEVELOPED_FILTER }
                  : { opacity: 1 }
              }
              transition={{ duration: developMs / 1000, ease: "easeOut" }}
            />
          </div>
          <div
            className="relative flex flex-col justify-between"
            style={{
              width: metrics.photoWidth,
              height: metrics.bottom,
              padding: `${metrics.noteTop}px 2px ${metrics.stampBottom}px`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-1 right-0.5 text-[9px] text-[color-mix(in_srgb,var(--lm-paper)_45%,var(--lm-ink-pen))] tabular-nums opacity-0 transition-opacity duration-200 [:focus-within>&]:opacity-100"
            >
              {splitGraphemes(note).length}/{INSTANT_CAMERA.noteMaxChars}
            </span>
            <textarea
              ref={noteRef}
              value={note}
              rows={INSTANT_CAMERA.noteMaxLines}
              placeholder={text.notePlaceholder}
              aria-label={text.noteLabel}
              spellCheck={false}
              className="w-full flex-none resize-none overflow-hidden border-0 bg-transparent p-0 leading-[1.05] text-[var(--lm-ink-pen)] outline-none placeholder:text-[color-mix(in_srgb,var(--lm-paper)_45%,var(--lm-ink-pen))]"
              style={{
                fontFamily: noteFont,
                fontSize: notePx,
                height: Math.ceil(
                  notePx * 1.05 * INSTANT_CAMERA.noteMaxLines + 6
                ),
              }}
              onChange={handleNoteChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
              }}
            />
            <div
              ref={stampRef}
              className="flex items-baseline justify-between gap-x-2 font-[family-name:var(--lm-font-mono)] tracking-wide text-[color-mix(in_srgb,var(--lm-paper)_45%,var(--lm-ink-pen))]"
              style={{ fontSize: metrics.stampPx }}
            >
              <span>{new URL(LAUNDROMAT_ORIGIN).host}</span>
              <span>{stampDate}</span>
            </div>
          </div>
        </motion.div>

        {share.canShareFiles ? (
          <button
            type="button"
            aria-label={text.shareLabel}
            disabled={share.isShareDisabled}
            className="flex h-11 cursor-pointer items-center gap-x-2.5 rounded-full border border-[var(--lm-line)] bg-transparent px-5 text-[12px] text-[var(--lm-ink-hi)] lowercase outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed disabled:cursor-default disabled:opacity-40"
            onClick={share.shareMore}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-[19px] fill-none stroke-current"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v8h14v-8" />
            </svg>
            {text.share}
          </button>
        ) : (
          <div className="flex max-w-[30rem] flex-wrap justify-center gap-x-1.5 gap-y-1.5">
            {SHARE_TARGETS.map((target) => (
              <button
                key={target.id}
                type="button"
                aria-label={text.shareOn({ platform: target.label })}
                disabled={share.isShareDisabled}
                className={SHARE_BUTTON_CLASS}
                onClick={() => share.shareToTarget({ id: target.id })}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-[19px] fill-current"
                >
                  <path d={SHARE_TARGET_ICON_PATHS[target.id]} />
                </svg>
                <span className={SHARE_TIP_CLASS}>{target.label}</span>
              </button>
            ))}
            <span
              aria-hidden
              className="h-[18px] w-px self-center bg-[var(--lm-line)]"
            />
            <button
              type="button"
              aria-label={text.moreLabel}
              disabled={share.isShareDisabled}
              className={SHARE_BUTTON_CLASS}
              onClick={share.shareMore}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-[19px] fill-none stroke-current"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v8h14v-8" />
              </svg>
              <span className={SHARE_TIP_CLASS}>{text.more}</span>
            </button>
            <button
              type="button"
              aria-label={text.downloadLabel}
              disabled={share.isShareDisabled}
              className={cn(
                SHARE_BUTTON_CLASS,
                "[@media(pointer:coarse)]:hidden"
              )}
              onClick={share.download}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-[19px] fill-none stroke-current"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M5 12v8h14v-8" />
              </svg>
              <span className={SHARE_TIP_CLASS}>{text.download}</span>
            </button>
          </div>
        )}

        {share.isAskingMastodon && (
          <form
            className="flex items-center gap-x-1.5 text-[10px]"
            onSubmit={share.submitMastodon}
          >
            <label
              htmlFor="lm-mastodon-server"
              className="text-[var(--lm-ink)]"
            >
              {text.mastodon.server}
            </label>
            <input
              id="lm-mastodon-server"
              value={share.mastodonInput}
              placeholder="mastodon.social"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className="w-44 border border-[var(--lm-line)] bg-[var(--lm-panel)] px-2 py-1.5 text-[var(--lm-ink-hi)] outline-none focus-visible:border-[var(--lm-ink)]"
              onChange={(event) =>
                share.setMastodonInput(event.currentTarget.value)
              }
            />
            <button
              type="submit"
              className="cursor-pointer border border-[var(--lm-line)] bg-transparent px-2 py-1.5 text-[var(--lm-ink-hi)] lowercase outline-none focus-visible:border-[var(--lm-ink)]"
            >
              {text.mastodon.post}
            </button>
          </form>
        )}

        <p
          role="status"
          className="min-h-4 max-w-[22.5rem] text-center text-[10px] text-[var(--lm-ink-hi)]"
        >
          <span
            className={cn(
              "block transition-opacity duration-250",
              toast?.visible !== true && "opacity-0"
            )}
          >
            {toast?.text}
          </span>
        </p>

        <div className="flex gap-x-5">
          <button
            type="button"
            className={ACTION_CLASS}
            onClick={props.onRetake}
          >
            {text.retake}
          </button>
          <button
            type="button"
            className={ACTION_CLASS}
            onClick={share.copyPhoto}
          >
            {text.copy}
          </button>
          <button type="button" className={ACTION_CLASS} onClick={props.onDone}>
            {text.done}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {handoff !== undefined && (
          <ShareHandoff
            key={handoff.url}
            handoff={handoff}
            onOpened={share.finishHandoff}
            onCancel={share.cancelHandoff}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
