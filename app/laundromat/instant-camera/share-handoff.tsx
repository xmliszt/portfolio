"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useIsPresent } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import type { ShareStep } from "@/lib/laundromat/instant-camera/share-targets";

const RING_RADIUS = 29;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const TICK_MS = 100;

export type Handoff = {
  label: string;
  iconPath: string;
  step: ShareStep;
  url: string;
  pasteKeys: string;
};

type ShareHandoffProps = {
  handoff: Handoff;
  onOpened: () => void;
  onCancel: () => void;
};

/** Show that the photo is ready, count down, then open `props.handoff.url` in a new tab; when the browser blocks a tab opened that late, wait for the visitor to press the open button instead. */
export function ShareHandoff(props: ShareHandoffProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.instantCamera.handoff;
  const isPresent = useIsPresent();
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(INSTANT_CAMERA.handoffMs / 1000)
  );
  const [isBlocked, setIsBlocked] = useState(false);
  const openRef = useRef<HTMLAnchorElement>(null);
  const onOpenedRef = useRef(props.onOpened);

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
        return text.pickFromDownloads({ file: INSTANT_CAMERA.printFileName });
      case "paste-in-post":
      case "paste-in-chat":
      case "paste-in-new-post": {
        const parts = {
          "paste-in-post": text.pasteInPost,
          "paste-in-chat": text.pasteInChat,
          "paste-in-new-post": text.pasteInNewPost,
        }[props.handoff.step];
        return (
          <>
            {parts.before}
            <kbd className="rounded border border-b-2 border-[var(--lm-line)] px-1.5 py-px font-[inherit] whitespace-nowrap text-[var(--lm-ink-hi)]">
              {props.handoff.pasteKeys}
            </kbd>
            {parts.after}
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
      aria-labelledby="lm-handoff-title"
      aria-describedby="lm-handoff-body"
      className="fixed inset-0 z-[420] grid place-items-center bg-black/70 px-[max(1rem,env(safe-area-inset-left))]"
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
        className="flex w-full max-w-[22.5rem] flex-col items-center gap-y-3.5 border border-[var(--lm-line)] bg-[var(--lm-panel)] px-6 pt-7 pb-5 text-center"
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
              className="stroke-[var(--lm-line)]"
            />
            {!isBlocked && (
              <motion.circle
                cx={32}
                cy={32}
                r={RING_RADIUS}
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                className="stroke-[var(--lm-ink-hi)]"
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
            className="size-7 fill-[var(--lm-ink-hi)]"
          >
            <path d={props.handoff.iconPath} />
          </svg>
        </span>
        <p
          id="lm-handoff-title"
          className="flex items-center gap-x-2 text-[15px] text-[var(--lm-ink-hi)]"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-4 fill-none stroke-[var(--lm-accent)]"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5l3 3 7-7" />
          </svg>
          {isSaved ? text.savedTitle : text.copiedTitle}
        </p>
        <p
          id="lm-handoff-body"
          className="text-xs leading-relaxed text-balance text-[var(--lm-ink)]"
        >
          {isBlocked
            ? text.blocked
            : text.opening({
                platform: props.handoff.label,
                seconds: secondsLeft,
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
            className="border border-[var(--lm-ink-hi)] bg-[var(--lm-ink-hi)] px-3.5 py-2 text-[11px] text-[var(--lm-bg)] no-underline outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
            onClick={() => props.onOpened()}
          >
            {isBlocked
              ? text.open({ platform: props.handoff.label })
              : text.openNow({ platform: props.handoff.label })}
          </a>
          <button
            type="button"
            className="cursor-pointer border border-[var(--lm-line)] bg-transparent px-3.5 py-2 text-[11px] text-[var(--lm-ink)] outline-none hover:border-[var(--lm-ink)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed"
            onClick={props.onCancel}
          >
            {text.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
