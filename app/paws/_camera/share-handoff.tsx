"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useIsPresent } from "motion/react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import type { Handoff } from "@/components/instant-camera/use-polaroid-share";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { fillCopy } from "@/lib/paws/maker/fill-copy";
import { cn } from "@/lib/utils";

import { PAWS_CAMERA } from "./paws-camera-config";

const RING_RADIUS = 29;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const TICK_MS = 100;

type ShareHandoffProps = {
  handoff: Handoff;
  onOpened: () => void;
  onCancel: () => void;
};

/** Show that the photo is ready, count down, then open `props.handoff.url` in a new tab; when the browser blocks a tab opened that late, wait for the visitor to press the open button instead. */
export function ShareHandoff(props: ShareHandoffProps) {
  const { copy } = usePawsCopy();
  const text = copy.camera.handoff;
  const isPresent = useIsPresent();
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(INSTANT_CAMERA.handoffMs / 1000)
  );
  const [isBlocked, setIsBlocked] = useState(false);
  const openRef = useRef<HTMLAnchorElement>(null);
  const onOpenedRef = useRef(props.onOpened);
  const platform = props.handoff.label;

  useEffect(() => {
    onOpenedRef.current = props.onOpened;
  }, [props.onOpened]);

  useEffect(() => {
    if (!isPresent) return;
    openRef.current?.focus({ preventScroll: true });
    const startedAt = performance.now();
    const tick = window.setInterval(() => {
      const leftMs = INSTANT_CAMERA.handoffMs - (performance.now() - startedAt);
      setSecondsLeft(Math.max(1, Math.ceil(leftMs / 1000)));
    }, TICK_MS);
    const timer = window.setTimeout(() => {
      window.clearInterval(tick);
      const tab = window.open(props.handoff.url, "_blank");
      if (tab === null) {
        setIsBlocked(true);
        return;
      }
      tab.opener = null;
      onOpenedRef.current();
    }, INSTANT_CAMERA.handoffMs);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(timer);
    };
  }, [props.handoff.url, isPresent]);

  const isSaved = props.handoff.step === "pick-from-downloads";
  const step = (() => {
    switch (props.handoff.step) {
      case "pick-from-downloads":
        return fillCopy({
          template: text.pickFromDownloads,
          values: { file: PAWS_CAMERA.printFileName },
        });
      case "paste-in-post":
      case "paste-in-chat":
      case "paste-in-new-post": {
        const template = {
          "paste-in-post": text.pasteInPost,
          "paste-in-chat": text.pasteInChat,
          "paste-in-new-post": text.pasteInNewPost,
        }[props.handoff.step];
        const [before = "", after = ""] = template.split("{keys}");
        return (
          <>
            {before}
            <kbd className="border-[1.5px] border-b-[3px] border-[var(--pw-ink)] px-1.5 py-px font-[inherit] whitespace-nowrap">
              {props.handoff.pasteKeys}
            </kbd>
            {after}
          </>
        );
      }
      default: {
        const unhandled: never = props.handoff.step;
        return unhandled;
      }
    }
  })();

  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pw-handoff-title"
      aria-describedby="pw-handoff-body"
      className="fixed inset-0 z-[60] grid place-items-center bg-[var(--pw-paper)]/80 px-[max(1rem,env(safe-area-inset-left))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          props.onCancel();
        }
      }}
    >
      <motion.div
        className="flex w-full max-w-[22.5rem] flex-col items-center gap-y-3.5 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-6 pt-7 pb-5 text-center text-[var(--pw-ink)] shadow-[3px_2px_0_var(--pw-pink)]"
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.25, ease: [0.3, 0.7, 0.2, 1] }}
      >
        <span className="relative grid size-18 place-items-center">
          <svg
            aria-hidden
            viewBox="0 0 64 64"
            className="absolute inset-0 size-full -rotate-90 fill-none"
            strokeWidth={2}
          >
            <circle
              cx={32}
              cy={32}
              r={RING_RADIUS}
              className="stroke-[var(--pw-rule)]"
            />
            {!isBlocked && (
              <motion.circle
                cx={32}
                cy={32}
                r={RING_RADIUS}
                strokeDasharray={RING_LENGTH}
                className="stroke-[var(--pw-ink)]"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: RING_LENGTH }}
                transition={{
                  duration: INSTANT_CAMERA.handoffMs / 1000,
                  ease: "linear",
                }}
              />
            )}
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-7 fill-[var(--pw-ink)]"
          >
            <path d={props.handoff.iconPath} />
          </svg>
        </span>
        <p
          id="pw-handoff-title"
          className="m-0 font-[family-name:var(--pw-font-display)] text-[20px] leading-none"
        >
          {isSaved ? text.savedTitle : text.copiedTitle}
        </p>
        <p
          id="pw-handoff-body"
          className="m-0 text-[12px] leading-relaxed text-balance text-[var(--pw-ink-soft)]"
        >
          {isBlocked
            ? text.blocked
            : fillCopy({
                template: text.opening,
                values: { platform, seconds: String(secondsLeft) },
              })}
          <br />
          {step}
        </p>
        <div className="flex gap-x-2.5">
          <a
            ref={openRef}
            href={props.handoff.url}
            target="_blank"
            rel="noopener"
            className={cn(
              FOCUS_RING_CLASS,
              "flex h-10 items-center border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-yellow)] px-3 text-[12px] font-medium text-[var(--pw-ink)] no-underline sm:h-8"
            )}
            onClick={() => props.onOpened()}
          >
            {fillCopy({
              template: isBlocked ? text.open : text.openNow,
              values: { platform },
            })}
          </a>
          <button
            type="button"
            className={cn(
              FOCUS_RING_CLASS,
              "h-10 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
            )}
            onClick={props.onCancel}
          >
            {text.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
