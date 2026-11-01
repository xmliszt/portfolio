"use client";

import { useEffect, useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { markPostPosted } from "@/app/cc/(app)/_actions/mark-post-posted";
import type { PlatformId } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

export type RunSheetItem = {
  id: string;
  timeLabel: string;
  platformId: PlatformId;
  kind: string;
  label: string;
  status: "posted" | "skipped" | "next" | "due" | "queued" | "draft";
  copyText: string;
  open:
    | { kind: "prefilled"; url: string }
    | { kind: "copy-then-open"; url: string }
    | { kind: "phone" }
    | { kind: "after-parent" };
};

type RunSheetRowProps = {
  item: RunSheetItem;
};

const STATUS_CLASS = {
  posted: "text-cc-ok",
  skipped: "text-muted-foreground line-through",
  next: "text-primary",
  due: "text-cc-warn",
  queued: "text-muted-foreground",
  draft: "text-muted-foreground",
} as const;

const NOTE_CLASS = "text-muted-foreground w-[88px] text-[11px] leading-tight";

export function RunSheetRow(props: RunSheetRowProps) {
  const item = props.item;
  const [isCopied, setIsCopied] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  async function copyText() {
    await navigator.clipboard.writeText(item.copyText);
    setIsCopied(true);
  }

  async function copyThenOpen(url: string) {
    await copyText();
    window.open(url, "_blank", "noopener");
  }

  function savePosted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      try {
        await markPostPosted({ postId: item.id, url: url.trim() || undefined });
        setIsMarking(false);
      } catch {
        setError("Could not save. Try again.");
      }
    });
  }

  const isOpen = item.status !== "posted" && item.status !== "skipped";

  return (
    <li className="border-cc-line-soft flex flex-col gap-y-2 border-b px-[18px] py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "w-[52px] text-[15px] font-bold tabular-nums",
            item.status === "next" && "text-primary"
          )}
        >
          {item.timeLabel}
        </span>
        <PlatformChip platformId={item.platformId} />
        <span className="text-cc-text-2 min-w-[140px] flex-1 truncate">
          {item.kind !== "post" && (
            <span className="text-muted-foreground">↳ </span>
          )}
          {item.label}
        </span>
        <span
          className={cn(
            "w-[64px] text-[11px] tracking-[0.1em]",
            STATUS_CLASS[item.status]
          )}
        >
          {item.status.toUpperCase()}
        </span>
        <div className="ml-auto flex items-center justify-end gap-x-2">
          <CcButton size="sm" onClick={copyText}>
            {isCopied ? "COPIED ✓" : "COPY"}
          </CcButton>
          {(() => {
            const open = item.open;
            switch (open.kind) {
              case "prefilled":
                return (
                  <a
                    href={open.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-primary bg-primary text-primary-foreground hover:bg-primary/85 inline-flex min-h-8 items-center border px-2.5 text-[11px] font-bold tracking-[0.1em]"
                  >
                    OPEN ↗
                  </a>
                );
              case "copy-then-open":
                return (
                  <CcButton
                    size="sm"
                    variant="primary"
                    onClick={() => copyThenOpen(open.url)}
                  >
                    COPY + OPEN ↗
                  </CcButton>
                );
              case "phone":
                return <span className={NOTE_CLASS}>post from your phone</span>;
              case "after-parent":
                return <span className={NOTE_CLASS}>under the main post</span>;
              default: {
                const unhandled: never = open;
                return unhandled;
              }
            }
          })()}
          {isOpen && (
            <CcButton
              size="sm"
              variant="ok"
              aria-expanded={isMarking}
              onClick={() => setIsMarking(!isMarking)}
            >
              MARK POSTED
            </CcButton>
          )}
        </div>
      </div>
      {isMarking && (
        <form
          onSubmit={savePosted}
          className="flex flex-wrap items-center gap-x-2 gap-y-2 pl-[64px]"
        >
          <label htmlFor={`posted-url-${item.id}`} className="sr-only">
            Live URL
          </label>
          <input
            id={`posted-url-${item.id}`}
            type="url"
            className="cc-input max-w-md flex-1"
            placeholder="Paste the live URL (optional)"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <CcButton type="submit" variant="ok" disabled={isPending}>
            {isPending ? "SAVING…" : "SAVE"}
          </CcButton>
          <CcButton type="button" onClick={() => setIsMarking(false)}>
            CANCEL
          </CcButton>
          {error !== undefined && (
            <span role="alert" className="text-cc-warn text-[11px]">
              {error}
            </span>
          )}
        </form>
      )}
    </li>
  );
}
