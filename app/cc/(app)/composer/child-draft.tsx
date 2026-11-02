"use client";

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
};

export function ChildDraft(props: ChildDraftProps) {
  const inputId = `body-${props.post.id}`;
  return (
    <div
      id={`post-${props.post.id}`}
      className="border-cc-line-soft flex flex-col gap-y-2 border-t px-[18px] py-4"
    >
      <label
        htmlFor={inputId}
        className="text-muted-foreground text-[11px] tracking-[0.14em]"
      >
        ↳ {props.label.toUpperCase()}
      </label>
      <textarea
        id={inputId}
        rows={4}
        autoFocus={props.focused}
        className="cc-input resize-y"
        value={props.body}
        onChange={(event) => props.onBodyChange(event.target.value)}
      />
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <CopyButton text={props.body.trimEnd()} size="sm" />
          <MarkPostedControl
            postId={props.post.id}
            status={props.post.status}
            postedAt={props.post.posted_at}
            url={props.post.url}
            size="sm"
          />
        </div>
        <CharacterCount
          count={countPostCharacters({
            text: props.body,
            platformId: props.platformId,
          })}
          limit={props.limit}
          platformId={props.platformId}
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
      <AssetsEditor
        postId={props.post.id}
        assets={props.assets}
        onChange={props.onAssetsChange}
      />
    </div>
  );
}
