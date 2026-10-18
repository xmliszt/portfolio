"use client";

import { useEffect, useRef, useState } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { REPORT_REASON_MAX_CHARS } from "@/lib/laundromat/notebook/report-reason-max-chars";

type ReportEntryDialogProps = {
  onCancel: () => void;
  onConfirm: (reason: string | undefined) => void;
};

/** Ask the visitor to confirm reporting a note, with an optional reason of up to `REPORT_REASON_MAX_CHARS` characters. */
export function ReportEntryDialog(props: ReportEntryDialogProps) {
  const { copy } = useLaundromatCopy();
  const text = copy.notebook.reportDialog;
  const [reason, setReason] = useState("");
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    reasonRef.current?.focus({ preventScroll: true });
  }, []);

  function confirm() {
    const trimmed = reason.trim();
    props.onConfirm(trimmed === "" ? undefined : trimmed);
  }

  return (
    <div
      className="absolute inset-0 z-30 grid place-items-center bg-black/40 px-4"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) props.onCancel();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") props.onCancel();
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          confirm();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="lm-report-title"
        aria-describedby="lm-report-body"
        className="flex w-full max-w-[22rem] flex-col gap-y-3 rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] p-5 font-[family-name:var(--lm-font-mono)] text-[12px] text-[var(--lm-ink)]"
      >
        <p id="lm-report-title" className="text-[14px] text-[var(--lm-ink-hi)]">
          {text.title}
        </p>
        <p id="lm-report-body" className="leading-relaxed">
          {text.body}
        </p>
        <label className="flex flex-col gap-y-1.5">
          <span className="lowercase">{text.reasonLabel}</span>
          <textarea
            ref={reasonRef}
            value={reason}
            rows={3}
            maxLength={REPORT_REASON_MAX_CHARS}
            placeholder={text.reasonPlaceholder}
            className="w-full resize-none rounded-md border border-[var(--lm-edge)] bg-[var(--lm-bg)] px-2.5 py-2 text-[var(--lm-ink-hi)] outline-none select-text placeholder:text-[var(--lm-line)] focus-visible:border-[var(--lm-ink)]"
            onChange={(event) => setReason(event.currentTarget.value)}
          />
          <span className="self-end text-[10px] tabular-nums opacity-60">
            {reason.length}/{REPORT_REASON_MAX_CHARS}
          </span>
        </label>
        <div className="flex justify-end gap-x-2">
          <button
            type="button"
            className="cursor-pointer rounded-md px-3 py-1.5 lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed"
            onClick={props.onCancel}
          >
            {text.cancel}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-[var(--lm-edge)] bg-[var(--lm-bg)] px-3 py-1.5 text-[var(--lm-ink-hi)] lowercase outline-none hover:border-[var(--lm-accent)] focus-visible:border-[var(--lm-accent)]"
            onClick={confirm}
          >
            {text.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
