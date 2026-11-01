"use client";

import { useEffect, useState, useTransition } from "react";
import isEqual from "lodash/isEqual.js";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { savePost } from "@/app/cc/(app)/_actions/save-post";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

import { ChatgptPanel } from "./chatgpt-panel";
import { ChildDraft } from "./child-draft";
import type { ComposerTab } from "./composer-tab";
import { ComposerTabs } from "./composer-tabs";
import type { DraftFields } from "./draft-fields";
import { getChatgptPrompt } from "./get-chatgpt-prompt";
import { getPreflightChecks } from "./get-preflight-checks";
import { parseHashtags } from "./parse-hashtags";
import { PostActions } from "./post-actions";
import { PostFieldsEditor } from "./post-fields-editor";
import { PreflightPanel } from "./preflight-panel";
import { toDraftFields } from "./to-draft-fields";
import { toPostFields } from "./to-post-fields";
import { VoiceCheckPanel } from "./voice-check-panel";

type ComposerProps = {
  campaign: { id: string; name: string; notes: string | null };
  post: PostRow;
  platformId: PlatformId;
  childPosts: readonly PostRow[];
  chatgptVariant: PostRow | undefined;
  tabs: readonly ComposerTab[];
  focusPostId: string | undefined;
  sameDayTargets: readonly string[];
};

export function Composer(props: ComposerProps) {
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      [props.post, ...props.childPosts].map((post) => [
        post.id,
        toDraftFields(post),
      ])
    )
  );
  const [savedDrafts, setSavedDrafts] = useState(drafts);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [isSaving, startSaving] = useTransition();

  const platform = PLATFORMS[props.platformId];
  const draft = drafts[props.post.id] ?? toDraftFields(props.post);
  const dirtyIds = Object.keys(drafts).filter(
    (id) => !isEqual(drafts[id], savedDrafts[id])
  );
  const isDirty = dirtyIds.length > 0;
  const copyText = getPostCopyText({
    body: draft.body,
    hashtags: parseHashtags(draft.hashtagsText),
  });
  const childBodies = props.childPosts.map(
    (child) => drafts[child.id]?.body ?? child.body
  );
  const hasTitle =
    platform.titleLimit !== undefined && draft.title.trim() !== "";
  const voiceText = hasTitle
    ? `${draft.title.trim()}\n\n${copyText}`
    : copyText;

  function updateDraft(options: { postId: string; draft: DraftFields }) {
    setDrafts({ ...drafts, [options.postId]: options.draft });
  }

  function save() {
    if (!isDirty || isSaving) return;
    const snapshot = drafts;
    setSaveError(undefined);
    startSaving(async () => {
      try {
        await Promise.all(
          dirtyIds.flatMap((postId) => {
            const fields = snapshot[postId];
            return fields === undefined
              ? []
              : [
                  savePost({
                    postId,
                    campaignId: props.campaign.id,
                    fields: toPostFields(fields),
                  }),
                ];
          })
        );
        setSavedDrafts(snapshot);
      } catch {
        setSaveError("Could not save. Your edits are still here; try again.");
      }
    });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const scheduledLabel =
    props.post.scheduled_at === null
      ? "UNSCHEDULED"
      : `SCHEDULED ${formatSgt({ date: new Date(props.post.scheduled_at), pattern: "EEE dd MMM HH:mm" }).toUpperCase()} SGT`;

  return (
    <>
      <ComposerTabs
        tabs={props.tabs}
        selectedPostId={props.post.id}
        dirty={isDirty}
      />
      <div className="flex flex-wrap items-start gap-x-5 gap-y-5">
        <Panel
          title={`Draft · ${platform.label}`}
          className="flex-[3_1_520px]"
          aside={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{scheduledLabel}</span>
              <span
                aria-live="polite"
                className={cn(
                  "tracking-[0.1em]",
                  isDirty ? "text-cc-warn" : "text-cc-ok"
                )}
              >
                {isSaving ? "SAVING…" : isDirty ? "● UNSAVED" : "SAVED ✓"}
              </span>
              <CcButton
                type="button"
                size="sm"
                variant={isDirty ? "primary" : "ghost"}
                disabled={!isDirty || isSaving}
                onClick={save}
                title="Save (⌘S / Ctrl+S)"
              >
                SAVE ⌘S
              </CcButton>
            </span>
          }
        >
          {saveError !== undefined && (
            <p
              role="alert"
              className="text-cc-warn border-b px-[18px] py-2 text-[12px]"
            >
              {saveError}
            </p>
          )}
          <PostFieldsEditor
            postId={props.post.id}
            platformId={props.platformId}
            draft={draft}
            copyText={copyText}
            onChange={(next) =>
              updateDraft({ postId: props.post.id, draft: next })
            }
          />
          <PostActions
            post={props.post}
            platformId={props.platformId}
            title={draft.title}
            copyText={copyText}
            link={draft.link}
            target={draft.target}
            assets={draft.assets}
          />
          {props.childPosts.map((child, index) => {
            const childDraft = drafts[child.id] ?? toDraftFields(child);
            return (
              <ChildDraft
                key={child.id}
                post={child}
                platformId={props.platformId}
                label={child.title ?? `${child.kind} ${index + 1}`}
                limit={
                  props.platformId === "producthunt"
                    ? undefined
                    : platform.bodyLimit
                }
                body={childDraft.body}
                focused={child.id === props.focusPostId}
                assets={childDraft.assets}
                onBodyChange={(body) =>
                  updateDraft({
                    postId: child.id,
                    draft: { ...childDraft, body },
                  })
                }
                onAssetsChange={(assets) =>
                  updateDraft({
                    postId: child.id,
                    draft: { ...childDraft, assets },
                  })
                }
              />
            );
          })}
        </Panel>
        <PreflightPanel
          platformLabel={platform.label}
          className="flex-[2_1_340px]"
          checks={getPreflightChecks({
            platformId: props.platformId,
            title: draft.title,
            body: draft.body,
            copyText,
            target: draft.target,
            assets: draft.assets,
            scheduledAt: props.post.scheduled_at,
            childBodies,
            sameDayTargets: props.sameDayTargets,
          })}
        />
      </div>
      <div className="flex flex-wrap items-start gap-x-5 gap-y-5">
        <VoiceCheckPanel
          text={voiceText}
          maxHashtags={platform.maxHashtags}
          className="flex-[1_1_380px]"
        />
        <ChatgptPanel
          key={props.chatgptVariant?.id ?? "none"}
          postId={props.post.id}
          platformId={props.platformId}
          copyText={copyText}
          variant={props.chatgptVariant}
          className="flex-[2_1_560px]"
          prompt={getChatgptPrompt({
            campaignName: props.campaign.name,
            makersNote: props.campaign.notes,
            platformId: props.platformId,
            title: hasTitle ? draft.title : "",
            copyText,
            target: draft.target,
            assets: draft.assets,
          })}
        />
      </div>
    </>
  );
}
