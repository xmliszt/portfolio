"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { SHARE_TARGET_ICON_PATHS } from "@/components/instant-camera/share-target-icon-paths";
import { usePolaroidShare } from "@/components/instant-camera/use-polaroid-share";
import { useViewportSize } from "@/components/instant-camera/use-viewport-size";
import { getNoteFontScale } from "@/lib/laundromat/instant-camera/get-note-font-scale";
import { getPolaroidMetrics } from "@/lib/laundromat/instant-camera/get-polaroid-metrics";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { SHARE_TARGETS } from "@/lib/laundromat/instant-camera/share-targets";
import { splitGraphemes } from "@/lib/laundromat/instant-camera/split-graphemes";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { fillCopy } from "@/lib/paws/maker/fill-copy";
import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";
import { RISO } from "@/lib/paws/riso-inks";
import { cn } from "@/lib/utils";

import { PAWS_CAMERA } from "./paws-camera-config";
import { ShareHandoff } from "./share-handoff";

const NOTE_FOCUS_DELAY_MS = 700;
const UNDEVELOPED_FILTER =
  "brightness(0.35) sepia(0.5) contrast(0.6) saturate(0.2)";
const DEVELOPED_FILTER = "brightness(1) sepia(0) contrast(1) saturate(1)";
const ICON_BUTTON_CLASS = cn(
  FOCUS_RING_CLASS,
  "group relative grid size-10 place-items-center text-[var(--pw-ink-soft)] transition-[color,translate] duration-150 hover:-translate-y-0.5 hover:text-[var(--pw-ink)] focus-visible:text-[var(--pw-ink)] disabled:opacity-40 motion-reduce:transition-none"
);
const TIP_CLASS =
  "pointer-events-none absolute top-full left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-[var(--pw-ink)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100";
const ACTION_CLASS = cn(
  FOCUS_RING_CLASS,
  "h-10 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
);

export type PawsPhoto = {
  url: string;
  orientation: ViewfinderOrientation;
  tiltDeg: number;
};

type PhotoSheetProps = {
  photo: PawsPhoto;
  inviteUrl: string;
  onRetake: () => void;
  onDone: () => void;
};

function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[19px] fill-none stroke-current"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v8h14v-8" />
    </svg>
  );
}

/** Show the developed photo of the room as a polaroid with a note to write on it, the platforms to share it to with an invite into the room, and buttons to retake, copy or close it. */
export function PhotoSheet(props: PhotoSheetProps) {
  const { copy } = usePawsCopy();
  const text = copy.camera;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const viewport = useViewportSize();
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shownNote = note === "" ? text.notePlaceholder : note;
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
      const stamp = stampRef.current;
      const noteElement = noteRef.current;
      return {
        noteFont:
          noteElement === null
            ? "serif"
            : getComputedStyle(noteElement).fontFamily,
        stampFont:
          stamp === null ? "monospace" : getComputedStyle(stamp).fontFamily,
        stamp: { left: new URL(PAWS_ORIGIN).host, right: stampDate },
        colors: { paper: RISO.paper, ink: RISO.ink, stamp: RISO.inkSoft },
      };
    },
    shareText,
    sheetText: `${shareText}\n${props.inviteUrl}`,
    siteUrl: props.inviteUrl,
    fileNames: {
      print: PAWS_CAMERA.printFileName,
      shared: PAWS_CAMERA.sharedFileName,
    },
    messages: {
      copied: text.copied,
      copyFailed: text.copyFailed,
      downloaded: text.downloaded,
      printFailed: text.snapFailed,
      mastodonAsk: text.mastodon.ask,
      pasteReminder: (values) =>
        fillCopy({ template: text.handoff.pasteReminder, values }),
      savedReminder: (values) =>
        fillCopy({ template: text.handoff.savedReminder, values }),
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

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={text.cardLabel}
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--pw-paper)]/90 px-[max(1rem,env(safe-area-inset-left))] pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.75rem,env(safe-area-inset-bottom))] text-[var(--pw-ink)]"
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
          className="flex max-w-full flex-col border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] shadow-[4px_3px_0_var(--pw-pink)]"
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
            className="relative overflow-hidden bg-[var(--pw-paper-deep)]"
            style={{ width: metrics.photoWidth, height: metrics.photoHeight }}
          >
            <motion.img
              src={props.photo.url}
              alt={text.photoAlt}
              className="block size-full object-cover"
              initial={
                prefersReducedMotion ? false : { filter: UNDEVELOPED_FILTER }
              }
              animate={{ filter: DEVELOPED_FILTER }}
              transition={{
                duration: PAWS_CAMERA.developMs / 1000,
                ease: "easeOut",
              }}
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
              className="pointer-events-none absolute top-1 right-0.5 text-[10px] text-[var(--pw-ink-soft)] tabular-nums opacity-0 transition-opacity duration-200 [:focus-within>&]:opacity-100"
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
              className="w-full flex-none resize-none overflow-hidden border-0 bg-transparent p-0 font-[family-name:var(--pw-font-display)] leading-[1.05] text-[var(--pw-ink)] outline-none placeholder:text-[var(--pw-ink-soft)]/60"
              style={{
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
              className="flex items-baseline justify-between gap-x-2 font-[family-name:var(--pw-font-mono)] tracking-wide text-[var(--pw-ink-soft)]"
              style={{ fontSize: metrics.stampPx }}
            >
              <span>{new URL(PAWS_ORIGIN).host}</span>
              <span>{stampDate}</span>
            </div>
          </div>
        </motion.div>

        {share.canShareFiles ? (
          <button
            type="button"
            aria-label={text.shareLabel}
            disabled={share.isShareDisabled}
            className={cn(
              FOCUS_RING_CLASS,
              "flex h-11 items-center gap-x-2.5 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-yellow)] px-5 text-[13px] font-medium text-[var(--pw-ink)] disabled:opacity-50"
            )}
            onClick={share.shareMore}
          >
            <ShareIcon />
            {text.share}
          </button>
        ) : (
          <div className="flex max-w-[30rem] flex-wrap justify-center gap-x-1.5 gap-y-1.5">
            {SHARE_TARGETS.map((target) => (
              <button
                key={target.id}
                type="button"
                aria-label={fillCopy({
                  template: text.shareOn,
                  values: { platform: target.label },
                })}
                disabled={share.isShareDisabled}
                className={ICON_BUTTON_CLASS}
                onClick={() => share.shareToTarget({ id: target.id })}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-[19px] fill-current"
                >
                  <path d={SHARE_TARGET_ICON_PATHS[target.id]} />
                </svg>
                <span className={TIP_CLASS}>{target.label}</span>
              </button>
            ))}
            <span
              aria-hidden
              className="h-[18px] w-[1.5px] self-center bg-[var(--pw-rule)]"
            />
            <button
              type="button"
              aria-label={text.moreLabel}
              disabled={share.isShareDisabled}
              className={ICON_BUTTON_CLASS}
              onClick={share.shareMore}
            >
              <ShareIcon />
              <span className={TIP_CLASS}>{text.more}</span>
            </button>
            <button
              type="button"
              aria-label={text.downloadLabel}
              disabled={share.isShareDisabled}
              className={cn(
                ICON_BUTTON_CLASS,
                "[@media(pointer:coarse)]:hidden"
              )}
              onClick={share.download}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-[19px] fill-none stroke-current"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M5 12v8h14v-8" />
              </svg>
              <span className={TIP_CLASS}>{text.download}</span>
            </button>
          </div>
        )}

        {share.isAskingMastodon && (
          <form
            className="flex items-center gap-x-1.5 text-[12px]"
            onSubmit={share.submitMastodon}
          >
            <label htmlFor="pw-mastodon-server">{text.mastodon.server}</label>
            <input
              id="pw-mastodon-server"
              value={share.mastodonInput}
              placeholder="mastodon.social"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className={cn(
                FOCUS_RING_CLASS,
                "h-10 w-44 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-2 sm:h-8"
              )}
              onChange={(event) =>
                share.setMastodonInput(event.currentTarget.value)
              }
            />
            <button type="submit" className={ACTION_CLASS}>
              {text.mastodon.post}
            </button>
          </form>
        )}

        <p
          role="status"
          className="m-0 min-h-4 max-w-[22.5rem] text-center text-[12px]"
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

        <div className="flex gap-x-2">
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
