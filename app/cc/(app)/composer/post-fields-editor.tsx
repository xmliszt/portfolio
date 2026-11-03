"use client";

import Link from "next/link";

import { CcField } from "@/app/cc/_ui/cc-field";
import { countPostCharacters } from "@/lib/cc/count-post-characters";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getDefaultWave } from "@/lib/cc/get-default-wave";
import { type Platform, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

import { AssetsEditor } from "./assets-editor";
import { CharacterCount } from "./character-count";
import type { DraftFields } from "./draft-fields";

type PostFieldsEditorProps = {
  postId: string;
  platformId: PlatformId;
  planned: boolean;
  scheduledAt: string | undefined;
  draft: DraftFields;
  copyText: string;
  onChange: (draft: DraftFields) => void;
};

export function PostFieldsEditor(props: PostFieldsEditorProps) {
  const platform = PLATFORMS[props.platformId];
  const titleLimit: number | undefined = platform.titleLimit;
  const bodyLimit: number | undefined = platform.bodyLimit;
  const draft = props.draft;
  const targetField: Platform["target"] = platform.target;
  const wave =
    draft.wave === "" ? getDefaultWave(draft.assets) : Number(draft.wave);
  const hasWave = props.planned && !platform.plannerPinned;

  function update(fields: Partial<DraftFields>) {
    props.onChange({ ...draft, ...fields });
  }

  return (
    <div className="flex flex-col gap-y-3 px-3 py-2.5">
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
      <CcField label="TEXT" htmlFor={`body-${props.postId}`}>
        <div className="flex flex-col gap-y-1">
          <textarea
            id={`body-${props.postId}`}
            className="cc-input field-sizing-content max-h-[60dvh] min-h-[160px] resize-y text-[13px] leading-[1.7]"
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
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        <div className="min-w-0 flex-[1_1_240px]">
          <CcField
            label={`HASHTAGS · MAX ${platform.maxHashtags}`}
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
      {(targetField !== undefined || hasWave) && (
        <div className="flex flex-wrap gap-x-3 gap-y-3">
          {targetField !== undefined && (
            <div className="min-w-0 flex-[1_1_240px]">
              <CcField
                label={targetField.label}
                htmlFor={`target-${props.postId}`}
              >
                <input
                  id={`target-${props.postId}`}
                  className="cc-input"
                  placeholder={targetField.placeholder}
                  value={draft.target}
                  onChange={(event) => update({ target: event.target.value })}
                />
              </CcField>
            </div>
          )}
          {hasWave && (
            <div className="flex min-w-0 flex-col gap-y-1">
              <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
                PLANNER WAVE ·{" "}
                {draft.wave === "" ? "FROM MEDIA" : "SET"}
              </span>
              {(() => {
                const waveLabel =
                  wave === undefined ? "Last wave" : `Wave ${wave}`;
                if (props.scheduledAt === undefined) {
                  return (
                    <span className="text-cc-text-2 flex min-h-7 items-center">
                      {waveLabel} · not scheduled
                    </span>
                  );
                }
                const scheduledAt = new Date(props.scheduledAt);
                const params = new URLSearchParams({
                  week: formatSgt({ date: scheduledAt, pattern: "yyyy-MM-dd" }),
                  edit: props.postId,
                });
                return (
                  <Link
                    href={`/calendar?${params.toString()}`}
                    title="Show in the calendar"
                    className="text-cc-text-2 hover:text-primary flex min-h-7 items-center underline-offset-4 hover:underline"
                  >
                    {waveLabel} ·{" "}
                    {formatSgt({
                      date: scheduledAt,
                      pattern: "EEE dd MMM HH:mm",
                    })}{" "}
                    →
                  </Link>
                );
              })()}
            </div>
          )}
        </div>
      )}
      <AssetsEditor
        postId={props.postId}
        assets={draft.assets}
        onChange={(assets) => update({ assets })}
      />
    </div>
  );
}
