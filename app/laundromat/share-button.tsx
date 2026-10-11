"use client";

import { useEffect, useState } from "react";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";

const COPIED_NOTICE_MS = 2200;

type ShareState = "idle" | "copied" | "copy-failed";

/** Share the laundromat's address, never a notebook page, through the system share sheet, or copy it when there is none. */
export function ShareButton() {
  const [state, setState] = useState<ShareState>("idle");
  const { copy } = useLaundromatCopy();

  useEffect(() => {
    if (state !== "copied") return;
    const timeout = window.setTimeout(() => setState("idle"), COPIED_NOTICE_MS);
    return () => window.clearTimeout(timeout);
  }, [state]);

  async function handleShare() {
    const data = {
      title: copy.site.name,
      text: copy.toolbar.shareText,
      url: LAUNDROMAT_ORIGIN,
    };
    if (navigator.share !== undefined && navigator.canShare?.(data) !== false) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(LAUNDROMAT_ORIGIN);
      setState("copied");
    } catch {
      setState("copy-failed");
    }
  }

  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-x-1.5 bg-transparent px-1.5 py-2 text-[11px] text-[var(--lm-line)] lowercase transition-colors duration-200 outline-none hover:text-[var(--lm-ink)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed"
      onClick={handleShare}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 fill-none stroke-current"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 1.5v6.5M3.5 4L6 1.5 8.5 4M2.5 6.5v3.5h7V6.5" />
      </svg>
      <span role="status" className="select-text">
        {(() => {
          switch (state) {
            case "idle":
              return copy.toolbar.share;
            case "copied":
              return copy.toolbar.linkCopied;
            case "copy-failed":
              return new URL(LAUNDROMAT_ORIGIN).host;
            default: {
              const unhandled: never = state;
              return unhandled;
            }
          }
        })()}
      </span>
    </button>
  );
}
