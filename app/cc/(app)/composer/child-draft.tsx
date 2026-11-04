"use client";

import { useState } from "react";

import { DeletePostButton } from "@/app/cc/_ui/delete-post-button";
import { countPostCharacters } from "@/lib/cc/count-post-characters";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import type { PlatformId } from "@/lib/cc/platforms";
import type { PostAsset } from "@/lib/cc/post-asset";

import { AssetsEditor } from "./assets-editor";
import { AutoPublishControl } from "./auto-publish-control";
import { CharacterCount } from "./character-count";
import { CopyButton } from "./copy-button";
import { MarkPostedControl } from "./mark-posted-control";

type ChildDraftProps = {
  post: PostRow;
  platformId: PlatformId;
  label: string;
  limit: number | undefined;
  body: string;
  focused: boolean;
  assets: readonly PostAsset[];
  onBodyChange: (body: string) => void;
  onAssetsChange: (assets: readonly PostAsset[]) => void;
  dirty: boolean;
  index: number;
};

export function ChildDraft(props: ChildDraftProps) {
  const inputId = `body-${props.post.id}`;
  const [isMediaOpen, setIsMediaOpen] = useState(props.assets.length > 0);
  return (
    <li
      id={`post-${props.post.id}`}
      className="border-cc-line-soft grid grid-cols-[28px_minmax(0,1fr)] gap-x-2 border-b px-3 py-2"
    >
      <div className="flex flex-col items-center gap-y-1 pt-0.5">
        <span className="bg-cc-panel-2 text-cc-text-2 flex size-5 items-center justify-center text-[10.5px] font-semibold tabular-nums">
          {props.index}
        </span>
        <span aria-hidden className="bg-border w-px flex-1" />
      </div>
      <div className="flex min-w-0 flex-col gap-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <label
            htmlFor={inputId}
            className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
          >
            ↳ {props.label}
          </label>
          <CharacterCount
            count={countPostCharacters({
              text: props.body,
              platformId: props.platformId,
            })}
            limit={props.limit}
            platformId={props.platformId}
          />
        </div>
        <textarea
          id={inputId}
          rows={3}
          autoFocus={props.focused}
          className="cc-input resize-y"
          value={props.body}
          onChange={(event) => props.onBodyChange(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
          <CopyButton text={props.body.trimEnd()} size="sm" />
          <MarkPostedControl
            postId={props.post.id}
            status={props.post.status}
            postedAt={props.post.posted_at}
            url={props.post.url}
            size="sm"
          />
          <DeletePostButton
            postId={props.post.id}
            name={props.label}
            afterHref={`/composer?post=${props.post.parent_post_id ?? props.post.id}`}
            size="sm"
          />
        </div>
        {isAutoPublishPlatform(props.platformId) &&
          (props.post.status === "draft" ||
            props.post.status === "scheduled") && (
            <AutoPublishControl
              post={props.post}
              platformId={props.platformId}
              dirty={props.dirty}
            />
          )}
        <details
          open={isMediaOpen}
          onToggle={(event) => setIsMediaOpen(event.currentTarget.open)}
          className="group"
        >
          <summary className="text-muted-foreground hover:text-foreground w-fit list-none text-[10.5px] tracking-[0.04em] uppercase [&::-webkit-details-marker]:hidden">
            {props.assets.length === 0
              ? "+ Media"
              : `Media (${props.assets.length})`}
          </summary>
          <div className="flex flex-col pt-1.5">
            <AssetsEditor
              postId={props.post.id}
              assets={props.assets}
              onChange={props.onAssetsChange}
            />
          </div>
        </details>
      </div>
    </li>
  );
}
