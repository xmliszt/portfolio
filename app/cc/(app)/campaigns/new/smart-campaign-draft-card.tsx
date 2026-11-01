import uniqBy from "lodash/uniqBy.js";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { CharacterCount } from "@/app/cc/(app)/composer/character-count";
import { parseHashtags } from "@/app/cc/(app)/composer/parse-hashtags";
import { PLATFORM_PREFLIGHT } from "@/app/cc/(app)/composer/platform-preflight";
import { checkVoice } from "@/lib/cc/check-voice";
import { countPostCharacters } from "@/lib/cc/count-post-characters";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import type { SmartCampaignDraft } from "@/lib/cc/match-smart-campaign-reply";
import { PLATFORMS } from "@/lib/cc/platforms";
import type { SmartCampaignEdit } from "@/lib/cc/smart-campaign-state";
import { cn } from "@/lib/utils";

type SmartCampaignDraftCardProps = {
  draft: SmartCampaignDraft;
  edit: SmartCampaignEdit;
  onEdit: (edit: SmartCampaignEdit) => void;
  onRemove: () => void;
};

export function SmartCampaignDraftCard(props: SmartCampaignDraftCardProps) {
  const draft = props.draft;
  const platform = PLATFORMS[draft.platformId];
  const bodyLimit: number | undefined = platform.bodyLimit;
  const titleLimit: number | undefined = platform.titleLimit;
  const hashtagRule = PLATFORM_PREFLIGHT[draft.platformId].hashtags;
  const hashtags = parseHashtags(props.edit.hashtags);
  const copyText = getPostCopyText({ body: props.edit.body, hashtags });
  const flags = uniqBy(
    checkVoice({ text: copyText, maxHashtags: platform.maxHashtags }),
    (flag) => flag.ruleId
  );
  const isChild = draft.kind !== "post";
  const hasTitle =
    !isChild && (titleLimit !== undefined || props.edit.title !== "");
  const hasTarget = !isChild && platform.target !== undefined;
  const id = `smart-${draft.ref}`;

  function update(fields: Partial<SmartCampaignEdit>) {
    props.onEdit({ ...props.edit, ...fields });
  }

  return (
    <article
      aria-label={draft.ref}
      className={cn(
        "bg-card flex min-w-0 flex-col gap-y-2.5 border p-3",
        isChild && "ml-4 border-dashed"
      )}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] tracking-[0.08em]">
        <PlatformChip platformId={draft.platformId} />
        <span className="font-bold">{draft.ref}</span>
        <span className="text-muted-foreground">
          {isChild
            ? `${draft.kind.toUpperCase()} TO ${draft.parentRef ?? "?"}`
            : "POST"}
          {" · "}
          {draft.language === "zh" ? "中文" : "EN"}
          {draft.media === "none" ? "" : ` · ${draft.media.toUpperCase()}`}
        </span>
        {!draft.isPlanned && (
          <span className="text-cc-warn">EXTRA · NOT IN THE PLAN</span>
        )}
        <CcButton
          type="button"
          size="sm"
          className="ml-auto"
          onClick={props.onRemove}
        >
          REMOVE
        </CcButton>
      </header>
      {draft.why !== undefined && (
        <p className="text-muted-foreground text-[12px]">{draft.why}</p>
      )}
      {(hasTitle || hasTarget) && (
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {hasTitle && (
            <div className="flex min-w-[220px] flex-[2] flex-col gap-y-1.5">
              <div className="flex items-center justify-between gap-x-2">
                <label
                  htmlFor={`${id}-title`}
                  className="text-muted-foreground text-[11px] tracking-[0.14em]"
                >
                  TITLE
                </label>
                <CharacterCount
                  count={countPostCharacters({
                    text: props.edit.title,
                    platformId: draft.platformId,
                  })}
                  limit={titleLimit}
                  platformId={draft.platformId}
                />
              </div>
              <input
                id={`${id}-title`}
                className="cc-input"
                value={props.edit.title}
                onChange={(event) => update({ title: event.target.value })}
              />
            </div>
          )}
          {hasTarget && (
            <div className="flex min-w-[160px] flex-1 flex-col gap-y-1.5">
              <label
                htmlFor={`${id}-target`}
                className="text-muted-foreground text-[11px] tracking-[0.14em]"
              >
                {platform.target?.label}
              </label>
              <input
                id={`${id}-target`}
                className="cc-input"
                placeholder={platform.target?.placeholder}
                value={props.edit.target}
                onChange={(event) => update({ target: event.target.value })}
              />
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-y-1.5">
        <div className="flex items-center justify-between gap-x-2">
          <label
            htmlFor={`${id}-body`}
            className="text-muted-foreground text-[11px] tracking-[0.14em]"
          >
            TEXT
          </label>
          <CharacterCount
            count={countPostCharacters({
              text: copyText,
              platformId: draft.platformId,
            })}
            limit={bodyLimit}
            platformId={draft.platformId}
          />
        </div>
        <textarea
          id={`${id}-body`}
          rows={Math.min(12, Math.max(3, props.edit.body.split("\n").length))}
          className="cc-input resize-y"
          value={props.edit.body}
          onChange={(event) => update({ body: event.target.value })}
        />
      </div>
      {(hashtagRule.max > 0 || props.edit.hashtags !== "") && (
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between gap-x-2">
            <label
              htmlFor={`${id}-hashtags`}
              className="text-muted-foreground text-[11px] tracking-[0.14em]"
            >
              HASHTAGS
            </label>
            <span
              className={cn(
                "text-[11px] tabular-nums",
                hashtags.length < hashtagRule.min ||
                  hashtags.length > hashtagRule.max
                  ? "text-cc-warn"
                  : "text-muted-foreground"
              )}
            >
              {hashtags.length} ·{" "}
              {hashtagRule.max === 0
                ? "none here"
                : `${hashtagRule.min}–${hashtagRule.max}`}
            </span>
          </div>
          <input
            id={`${id}-hashtags`}
            className="cc-input"
            value={props.edit.hashtags}
            onChange={(event) => update({ hashtags: event.target.value })}
          />
        </div>
      )}
      {flags.length > 0 && (
        <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
          {flags.map((flag) => (
            <li
              key={flag.ruleId}
              title={flag.reason}
              className="border-cc-warn text-cc-warn border px-2 py-0.5 text-[11px]"
            >
              {flag.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
