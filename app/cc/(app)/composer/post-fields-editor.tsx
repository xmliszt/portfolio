"use client";

import { CcField } from "@/app/cc/_ui/cc-field";
import { countPostCharacters } from "@/lib/cc/count-post-characters";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

import { AssetsEditor } from "./assets-editor";
import { CharacterCount } from "./character-count";
import type { DraftFields } from "./draft-fields";

type PostFieldsEditorProps = {
  postId: string;
  platformId: PlatformId;
  draft: DraftFields;
  copyText: string;
  onChange: (draft: DraftFields) => void;
};

export function PostFieldsEditor(props: PostFieldsEditorProps) {
  const platform = PLATFORMS[props.platformId];
  const titleLimit: number | undefined = platform.titleLimit;
  const bodyLimit: number | undefined = platform.bodyLimit;
  const draft = props.draft;

  function update(fields: Partial<DraftFields>) {
    props.onChange({ ...draft, ...fields });
  }

  return (
    <div className="flex flex-col gap-y-4 px-[18px] py-4">
      {titleLimit !== undefined && (
        <CcField label="TITLE" htmlFor={`title-${props.postId}`}>
          <div className="flex flex-col gap-y-1">
            <input
              id={`title-${props.postId}`}
              className="cc-input"
              value={draft.title}
              onChange={(event) => update({ title: event.target.value })}
            />
            <CharacterCount
              count={countPostCharacters({
                text: draft.title,
                platformId: props.platformId,
              })}
              limit={titleLimit}
              platformId={props.platformId}
            />
          </div>
        </CcField>
      )}
      {props.platformId === "reddit" && (
        <CcField label="SUBREDDIT" htmlFor={`target-${props.postId}`}>
          <input
            id={`target-${props.postId}`}
            className="cc-input"
            placeholder="r/SideProject"
            value={draft.target}
            onChange={(event) => update({ target: event.target.value })}
          />
        </CcField>
      )}
      <CcField label="TEXT" htmlFor={`body-${props.postId}`}>
        <div className="flex flex-col gap-y-1">
          <textarea
            id={`body-${props.postId}`}
            className="cc-input min-h-[220px] resize-y text-[15px] leading-[1.75]"
            value={draft.body}
            onChange={(event) => update({ body: event.target.value })}
          />
          <CharacterCount
            count={countPostCharacters({
              text: props.copyText,
              platformId: props.platformId,
            })}
            limit={bodyLimit}
            platformId={props.platformId}
            showRule
          />
        </div>
      </CcField>
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="min-w-0 flex-[1_1_240px]">
          <CcField
            label={`HASHTAGS · SPACE-SEPARATED, NO # · MAX ${platform.maxHashtags}`}
            htmlFor={`hashtags-${props.postId}`}
          >
            <input
              id={`hashtags-${props.postId}`}
              className="cc-input"
              placeholder="digitalart cats"
              value={draft.hashtagsText}
              onChange={(event) => update({ hashtagsText: event.target.value })}
            />
          </CcField>
        </div>
        <div className="min-w-0 flex-[1_1_240px]">
          <CcField label="LINK" htmlFor={`link-${props.postId}`}>
            <input
              id={`link-${props.postId}`}
              type="url"
              className="cc-input"
              placeholder="https://paws.garden"
              value={draft.link}
              onChange={(event) => update({ link: event.target.value })}
            />
          </CcField>
        </div>
      </div>
      <AssetsEditor
        postId={props.postId}
        assets={draft.assets}
        onChange={(assets) => update({ assets })}
      />
    </div>
  );
}
