"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { HANDWRITING_FONT_FAMILIES } from "@/app/laundromat/notebook/handwriting-fonts";
import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { URL_REVOKE_MS } from "@/app/laundromat/settings/url-revoke-ms";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";
import { TOKEN_CODE_HASH_PREFIX } from "@/lib/laundromat/tip/token-code-format";
import { cn } from "@/lib/utils";

const PRINT = { durationS: 1.1, feedSteps: 9, startPx: -12, fadeS: 0.2 };
const KEYS_FADE_S = 0.25;
const COPIED_MS = 1600;
const DASHED_RULE =
  "h-px bg-[repeating-linear-gradient(90deg,rgb(43_38_32/0.45)_0_3px,transparent_3px_6px)]";

type TipReceiptProps = {
  token: TipToken;
  printing: boolean;
  hint: boolean;
};

function feedEase(progress: number) {
  return Math.ceil(progress * PRINT.feedSteps) / PRINT.feedSteps;
}

/** Print a tip token as a paper laundry ticket: its number and date, its code, and a handwritten thank-you, with keys to copy a restore link or save the ticket as a file and, when `hint`, why to keep the code; while `printing` the paper feeds out of a slot line by line. */
export function TipReceipt(props: TipReceiptProps) {
  const { token } = props;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isCopied, setIsCopied] = useState(false);
  const copiedTimerRef = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(copiedTimerRef.current), []);
  const codeRef = useRef<HTMLElement>(null);
  const numberLabel = tipCopy.receiptNumber({ number: token.number });
  const date = formatTipDate(token.createdAt);

  async function copyLink() {
    const link = `${window.location.origin}${window.location.pathname}${TOKEN_CODE_HASH_PREFIX}${token.code}`;
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(
        () => setIsCopied(false),
        COPIED_MS
      );
    } catch {
      if (codeRef.current !== null) {
        window.getSelection()?.selectAllChildren(codeRef.current);
      }
    }
  }

  function save() {
    const text = [
      `${tipCopy.siteName} ${tipCopy.receiptKind} ${numberLabel}`,
      date,
      "",
      token.code,
      "",
      tipCopy.keepCode,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `laundro-cafe-token-${token.number}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_MS);
  }

  const isFeeding = props.printing && !prefersReducedMotion;
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="relative flex w-full flex-col items-center pt-1">
        {props.printing && (
          <span
            aria-hidden
            className="absolute top-0 z-[1] h-2 w-full max-w-[276px] rounded-full bg-[#050505] shadow-[inset_0_1px_2px_#000,0_1px_0_rgb(255_255_255/0.06)]"
          />
        )}
        <motion.div
          className="w-full max-w-[260px] [filter:drop-shadow(0_6px_10px_rgb(0_0_0/0.45))]"
          initial={
            isFeeding
              ? { clipPath: "inset(0 0 100% 0)", y: PRINT.startPx }
              : { opacity: 0 }
          }
          animate={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
          transition={
            isFeeding
              ? { duration: PRINT.durationS, ease: feedEase }
              : { duration: PRINT.fadeS }
          }
        >
          <div className="flex flex-col gap-y-2.5 bg-[linear-gradient(180deg,#e2dbcc,#d9d1c1_30%,#cec6b6)] px-4 pt-4 pb-5 font-[family-name:var(--lm-font-mono)] text-[10px] leading-[15px] text-[#2b2620] lowercase [mask:conic-gradient(from_135deg_at_top,#0000,#000_1deg_89deg,#0000_90deg)_50%/8px_100%]">
            <span className="flex items-baseline justify-between gap-x-2">
              <span className="font-[family-name:var(--lm-font-display)] text-[15px] leading-[18px] normal-case">
                laundro.cafe
              </span>
              <span>{numberLabel}</span>
            </span>
            <span className="flex justify-between gap-x-2 opacity-70">
              <span>{tipCopy.receiptKind}</span>
              <span>{date}</span>
            </span>
            <span className={DASHED_RULE} />
            <span className="flex flex-col gap-y-1">
              <span className="opacity-70">{tipCopy.receiptCode}</span>
              <code
                ref={codeRef}
                className="font-[family-name:var(--lm-font-mono)] text-[14px] leading-5 tracking-[0.06em] normal-case select-all"
              >
                {token.code}
              </code>
            </span>
            <span className={DASHED_RULE} />
            <span
              className="text-[21px] leading-6 text-[#28406b] normal-case"
              style={{ fontFamily: HANDWRITING_FONT_FAMILIES.latin }}
            >
              {tipCopy.receiptNote}
            </span>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="flex w-full flex-col items-center gap-y-3"
        initial={isFeeding ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{
          delay: isFeeding ? PRINT.durationS : 0,
          duration: KEYS_FADE_S,
        }}
      >
        <div className="flex gap-x-2">
          <button
            type="button"
            className={PRINTER_KEY_CLASS}
            onClick={() => void copyLink()}
          >
            <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
              <path d="M5 7l2-2M4.5 5.5 3.25 6.75a1.77 1.77 0 0 0 2.5 2.5L7 8M7.5 6.5l1.25-1.25a1.77 1.77 0 0 0-2.5-2.5L5 4" />
            </svg>
            {isCopied ? tipCopy.copied : tipCopy.copyLink}
          </button>
          <button type="button" className={PRINTER_KEY_CLASS} onClick={save}>
            <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
              <path d="M6 2v5.5M3.75 5.25 6 7.5l2.25-2.25M2.5 9.5h7" />
            </svg>
            {tipCopy.save}
          </button>
        </div>
        {props.hint && (
          <p
            className={cn(
              SETTINGS_META_CLASS,
              "m-0 max-w-[260px] text-center normal-case opacity-60"
            )}
          >
            {tipCopy.keepCode}
          </p>
        )}
      </motion.div>
    </div>
  );
}
