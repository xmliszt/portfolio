"use client";

import { useState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { DeletePostButton } from "@/app/cc/_ui/delete-post-button";
import { PopoverMenu } from "@/app/cc/_ui/popover-menu";
import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getOriginalUrl } from "@/lib/cc/get-original-url";
import { getPostName } from "@/lib/cc/get-post-name";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { PostAsset } from "@/lib/cc/post-asset";
import { cn } from "@/lib/utils";

import { AutoPublishControl } from "./auto-publish-control";
import { CopyButton } from "./copy-button";
import { ForkPostControl } from "./fork-post-control";
import { MarkPostedControl } from "./mark-posted-control";
import { RepostModeControl } from "./repost-mode-control";
import { ScheduleControl } from "./schedule-control";
import { writeClipboard } from "./write-clipboard";

type PostActionsProps = {
  post: PostRow;
  platformId: PlatformId;
  title: string;
  copyText: string;
  link: string;
  target: string;
  originalRef: string;
  assets: readonly PostAsset[];
  dirty: boolean;
  saving: boolean;
  saveError: string | undefined;
  onSave: () => void;
};

export function PostActions(props: PostActionsProps) {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const platform = PLATFORMS[props.platformId];
  const isUnposted =
    props.post.status === "draft" || props.post.status === "scheduled";
  const isAutoPlatform = isAutoPublishPlatform(props.platformId);
  const compose = buildComposeUrl({
    platformId: props.platformId,
    body: props.copyText,
    title: props.title.trim() || undefined,
    link: props.link.trim() || undefined,
    target: props.target.trim() || undefined,
    originalUrl: getOriginalUrl({
      platform: props.platformId,
      original_ref: props.originalRef.trim() || null,
    }),
  });

  async function handleCopyThenOpen() {
    const copying = writeClipboard(props.copyText);
    window.open(compose.url, "_blank", "noopener");
    setMessage(
      (await copying)
        ? `Text copied. Paste it into ${platform.label}.`
        : "Could not copy. Use Copy text, then paste."
    );
  }

  const scheduleLabel =
    props.post.scheduled_at === null
      ? "Unscheduled"
      : `${formatSgt({ date: new Date(props.post.scheduled_at), pattern: "EEE dd MMM HH:mm" })} SGT`;

  return (
    <div className="bg-card sticky bottom-0 z-20 flex flex-col gap-y-2 border-t px-3 py-2 shadow-[0_-8px_16px_hsl(var(--cc-shadow))]">
      <div className="flex flex-col gap-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span
            aria-live="polite"
            className={cn(
              "font-semibold tracking-[0.04em]",
              props.dirty ? "text-cc-warn" : "text-cc-ok"
            )}
          >
            {props.saving ? "SAVING…" : props.dirty ? "● UNSAVED" : "SAVED ✓"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-cc-text-2 tabular-nums">{scheduleLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
          <CcButton
            type="button"
            variant={props.dirty ? "primary" : "ghost"}
            disabled={!props.dirty || props.saving}
            onClick={props.onSave}
            title="Save (⌘S / Ctrl+S)"
          >
            SAVE ⌘S
          </CcButton>
          {props.post.status !== "posted" && (
            <PopoverMenu label="SCHEDULE">
              <ScheduleControl post={props.post} />
            </PopoverMenu>
          )}
          <CopyButton text={props.copyText} label="COPY TEXT" />
          {(() => {
            if (platform.postsFromPhone) {
              return (
                <span className="text-cc-text-2 inline-flex h-7 items-center border border-dashed px-2.5 text-[11px] tracking-[0.04em]">
                  POST FROM PHONE
                </span>
              );
            }
            switch (compose.kind) {
              case "prefilled":
                return (
                  <a
                    href={compose.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex h-7 items-center border px-2.5 text-[11px] font-semibold tracking-[0.04em]",
                      isAutoPlatform
                        ? "text-cc-text-2 hover:border-primary hover:text-foreground"
                        : "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
                    )}
                  >
                    OPEN {platform.shortLabel} ↗
                  </a>
                );
              case "copy-then-open":
                return (
                  <CcButton
                    type="button"
                    variant={isAutoPlatform ? "ghost" : "primary"}
                    onClick={handleCopyThenOpen}
                  >
                    COPY + OPEN {platform.shortLabel} ↗
                  </CcButton>
                );
              default: {
                const unhandled: never = compose;
                return unhandled;
              }
            }
          })()}
          <MarkPostedControl
            postId={props.post.id}
            status={props.post.status}
            postedAt={props.post.posted_at}
            url={props.post.url}
          />
          <PopoverMenu label="MORE" align="end" widthClassName="w-[280px]">
            <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
              Fork this post
            </span>
            <ForkPostControl
              post={props.post}
              platformId={props.platformId}
              dirty={props.dirty}
              startOpen
            />
            <div className="flex flex-col gap-y-1 border-t pt-2">
              <DeletePostButton
                postId={props.post.id}
                name={getPostName(props.post) || platform.label}
                afterHref="/composer"
                size="sm"
              />
            </div>
          </PopoverMenu>
        </div>
      </div>
      {isAutoPublishPlatform(props.platformId) &&
        isUnposted &&
        (props.post.kind === "post" ||
          props.post.kind === "repost" ||
          props.post.original_ref !== null) && (
          <div className="border-cc-line-soft flex flex-wrap items-start gap-x-4 gap-y-2 border-t pt-2">
            {props.post.kind === "repost" && (
              <RepostModeControl
                post={props.post}
                platformId={props.platformId}
              />
            )}
            <AutoPublishControl
              post={props.post}
              platformId={props.platformId}
              dirty={props.dirty}
            />
          </div>
        )}
      {platform.postsFromPhone && (
        <p className="text-muted-foreground text-[11px]">
          Post from your phone with:{" "}
          {props.assets.length === 0
            ? "no assets listed."
            : props.assets
                .map(
                  (asset) =>
                    `${asset.file}${asset.alt.trim() === "" ? "" : " (alt ✓)"}`
                )
                .join(" · ")}
        </p>
      )}
      {props.saveError !== undefined && (
        <p role="alert" className="text-cc-warn text-[11px]">
          {props.saveError}
        </p>
      )}
      {message !== undefined && (
        <p role="status" className="text-cc-text-2 text-[11px]">
          {message}
        </p>
      )}
    </div>
  );
}
