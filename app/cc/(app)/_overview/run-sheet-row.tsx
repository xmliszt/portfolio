"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { OtherChip } from "@/app/cc/_ui/other-chip";
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
  /** The custom post's project, or `undefined` for a campaign post. */
  project: string | undefined;
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

const NOTE_CLASS = "text-muted-foreground px-2 text-[11px] leading-tight";

const QUIET_CLASS = "w-full border-transparent";

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
    <li className="border-cc-line-soft hover:bg-cc-panel-2/60 flex flex-col gap-y-1.5 border-b px-3 py-1">
      <div className="flex min-h-7 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "w-[40px] text-[12px] font-semibold tabular-nums",
            item.status === "next" && "text-primary"
          )}
        >
          {item.timeLabel}
        </span>
        <span className="flex w-[60px] shrink-0">
          <PlatformChip platformId={item.platformId} />
        </span>
        <Link
          href={`/composer?post=${item.id}`}
          title="Open in composer"
          className="text-cc-text-2 hover:text-primary min-w-[140px] flex-1 truncate underline-offset-4 hover:underline"
        >
          {item.project !== undefined && (
            <>
              <OtherChip />{" "}
              <span className="text-foreground font-semibold">
                {item.project} ·{" "}
              </span>
            </>
          )}
          {item.kind !== "post" && (
            <span className="text-muted-foreground">
              {item.kind === "repost" ? "↻ Repost · " : "↳ "}
            </span>
          )}
          {item.label}
        </Link>
        <span
          className={cn(
            "w-[64px] text-[10.5px] font-semibold tracking-[0.04em]",
            STATUS_CLASS[item.status]
          )}
        >
          {item.status.toUpperCase()}
        </span>
        <div className="grid shrink-0 grid-cols-[76px_108px_92px] items-center gap-x-1">
          <CcButton size="sm" className={QUIET_CLASS} onClick={copyText}>
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
                    className={cn(
                      "inline-flex h-6 w-full items-center justify-center border px-2 text-[10.5px] font-semibold tracking-[0.04em]",
                      isOpen
                        ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
                        : "text-cc-text-2 hover:border-primary hover:text-foreground border-transparent"
                    )}
                  >
                    OPEN ↗
                  </a>
                );
              case "copy-then-open":
                return (
                  <CcButton
                    size="sm"
                    variant={isOpen ? "primary" : "ghost"}
                    className={cn(
                      "cursor-pointer",
                      isOpen ? "w-full" : QUIET_CLASS
                    )}
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
          {isOpen ? (
            <CcButton
              size="sm"
              variant="ok"
              className={QUIET_CLASS}
              aria-expanded={isMarking}
              onClick={() => setIsMarking(!isMarking)}
            >
              MARK POSTED
            </CcButton>
          ) : (
            <span />
          )}
        </div>
      </div>
      {isMarking && (
        <form
          onSubmit={savePosted}
          className="flex flex-wrap items-center gap-x-2 gap-y-2 pb-1.5 pl-[50px]"
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
