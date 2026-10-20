"use client";

import { useEffect, useRef, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import { cn } from "@/lib/utils";

import { COPIED_MS } from "./copied-ms";

type CopyCodeButtonProps = {
  code: string;
  codeRef: React.RefObject<HTMLElement | null>;
  tone: "paper" | "panel";
};

/** Render an icon key that copies `code` to the clipboard and shows a tick for `COPIED_MS`, or selects the text in `codeRef` when the clipboard refuses, inked on the ticket when `tone` is `paper` or a printer key when `panel`. */
export function CopyCodeButton(props: CopyCodeButtonProps) {
  const { copy } = useLaundromatCopy();
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(props.code);
    } catch {
      if (props.codeRef.current !== null) {
        window.getSelection()?.selectAllChildren(props.codeRef.current);
      }
      return;
    }
    setIsCopied(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsCopied(false), COPIED_MS);
  }

  return (
    <button
      type="button"
      aria-label={isCopied ? copy.tip.codeCopied : copy.tip.copyCode}
      title={isCopied ? copy.tip.codeCopied : copy.tip.copyCode}
      className={
        props.tone === "panel"
          ? cn(PRINTER_KEY_CLASS, "w-8 justify-center px-0")
          : "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[6px] text-[#2b2620] opacity-70 transition-[opacity,background-color] duration-150 outline-none hover:bg-[rgb(43_38_32/0.08)] hover:opacity-100 focus-visible:shadow-[0_0_0_1.5px_#2b2620] active:bg-[rgb(43_38_32/0.14)]"
      }
      onClick={() => void copyCode()}
    >
      <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
        {isCopied ? (
          <path d="M2.75 6.25l2.25 2.25 4.25-4.75" />
        ) : (
          <>
            <rect x={4} y={4} width={5.5} height={5.5} rx={1.2} />
            <path d="M8 2.5H3.7a1.2 1.2 0 0 0-1.2 1.2V8" />
          </>
        )}
      </svg>
    </button>
  );
}
