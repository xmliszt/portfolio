"use client";

import { useState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { buildComposeUrl } from "@/lib/cc/build-compose-url";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { PostAsset } from "@/lib/cc/post-asset";

import { AutoPublishControl } from "./auto-publish-control";
import { CopyButton } from "./copy-button";
import { ForkPostControl } from "./fork-post-control";
import { MarkPostedControl } from "./mark-posted-control";
import { writeClipboard } from "./write-clipboard";

type PostActionsProps = {
  post: PostRow;
  platformId: PlatformId;
  title: string;
  copyText: string;
  link: string;
  target: string;
  assets: readonly PostAsset[];
  dirty: boolean;
};

export function PostActions(props: PostActionsProps) {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const platform = PLATFORMS[props.platformId];
  const compose = buildComposeUrl({
    platformId: props.platformId,
    body: props.copyText,
    title: props.title.trim() || undefined,
    link: props.link.trim() || undefined,
    target: props.target.trim() || undefined,
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

  return (
    <div className="flex flex-col gap-y-3 border-t px-[18px] py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <CopyButton text={props.copyText} label="COPY TEXT" />
        {(() => {
          if (platform.postsFromPhone) {
            return (
              <span className="text-cc-warn border-cc-warn/40 inline-flex min-h-11 items-center border px-3 text-[12px] tracking-[0.1em]">
                POST FROM YOUR PHONE
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
                  className="border-primary bg-primary text-primary-foreground hover:bg-primary/85 inline-flex min-h-11 items-center border px-4 text-[12px] font-bold tracking-[0.1em]"
                >
                  OPEN {platform.shortLabel} COMPOSE ↗
                </a>
              );
            case "copy-then-open":
              return (
                <CcButton
                  type="button"
                  variant="primary"
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
      </div>
      <ForkPostControl
        post={props.post}
        platformId={props.platformId}
        dirty={props.dirty}
      />
      {isAutoPublishPlatform(props.platformId) &&
        (props.post.kind === "post" || props.post.kind === "repost") &&
        (props.post.status === "draft" ||
          props.post.status === "scheduled") && (
          <AutoPublishControl
            post={props.post}
            platformId={props.platformId}
            dirty={props.dirty}
          />
        )}
      {platform.postsFromPhone && (
        <div className="flex flex-col gap-y-1 text-[12px]">
          <span className="text-muted-foreground text-[11px] tracking-[0.14em]">
            COPY THE TEXT, THEN POST FROM YOUR PHONE WITH:
          </span>
          <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
            {props.assets.length === 0 && (
              <li className="text-muted-foreground">No assets listed.</li>
            )}
            {props.assets.map((asset, index) => (
              <li key={index} className="border px-2 py-1 text-[11px]">
                {asset.file}
                {asset.alt.trim() !== "" && (
                  <span className="text-cc-ok"> · alt ✓</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {message !== undefined && (
        <p role="status" className="text-cc-text-2 text-[12px]">
          {message}
        </p>
      )}
    </div>
  );
}
