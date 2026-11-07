"use client";

import { useEffect, useState, useTransition } from "react";
import isEqual from "lodash/isEqual.js";

import { Panel } from "@/app/cc/_ui/panel";
import { savePost } from "@/app/cc/(app)/_actions/save-post";
import { FOCUS_CHANGE_EVENT } from "@/app/cc/(app)/confirm-focus-change";
import { isInternalNavigation } from "@/app/cc/(app)/is-internal-navigation";
import { canTakeReplies } from "@/lib/cc/can-take-replies";
import type { PostRow } from "@/lib/cc/data/cc-rows";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

import { AddReplyButton } from "./add-reply-button";
import { ChatgptPanel } from "./chatgpt-panel";
import { CheckTagsPanel } from "./check-tags-panel";
import { ChecksColumn } from "./checks-column";
import { ChildDraft } from "./child-draft";
import { ComposerPostList } from "./composer-post-list";
import type { ComposerPostRow } from "./composer-post-row";
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
import { XTagCheckPanel } from "./x-tag-check-panel";

type ComposerProps = {
  campaign: { id: string | undefined; name: string; notes: string | null };
  post: PostRow;
  platformId: PlatformId;
  childPosts: readonly PostRow[];
  repostOf: PostRow | undefined;
  chatgptVariant: PostRow | undefined;
  rows: readonly ComposerPostRow[];
  focusPostId: string | undefined;
  sameDayTargets: readonly string[];
  campaignSwitcher: React.ReactNode;
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
  const dirtyIds = [props.post, ...props.childPosts]
    .map((post) => post.id)
    .filter((id) => !isEqual(drafts[id], savedDrafts[id]));
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
  const hasOriginal =
    props.post.campaign_id === null &&
    (props.post.kind === "reply" || props.post.kind === "repost");
  const voiceText = hasTitle
    ? `${draft.title.trim()}\n\n${copyText}`
    : copyText;

  function updateDraft(options: { postId: string; draft: DraftFields }) {
    setDrafts({ ...drafts, [options.postId]: options.draft });
  }

  function save() {
    if (!isDirty || isSaving) return;
    const snapshot = drafts;
    if (hasOriginal && draft.originalRef.trim() === "") {
      setSaveError("Paste the original post's link or id first.");
      return;
    }
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
    function handleClick(event: MouseEvent) {
      if (
        isInternalNavigation(event) &&
        !window.confirm("Leave without saving this draft?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function handleFocusChange(event: Event) {
      if (!window.confirm("Leave without saving this draft?")) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener(FOCUS_CHANGE_EVENT, handleFocusChange);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener(FOCUS_CHANGE_EVENT, handleFocusChange);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty]);

  const checks = getPreflightChecks({
    platformId: props.platformId,
    title: draft.title,
    body: draft.body,
    copyText,
    target: draft.target,
    assets: draft.assets,
    scheduledAt: props.post.scheduled_at,
    childBodies,
    sameDayTargets: props.sameDayTargets,
    now: new Date(),
  });
  const computedChecks = checks.flatMap((check) =>
    check.kind === "computed" ? [check] : []
  );
  const passedCount = computedChecks.filter((check) => check.passed).length;
  const failedCount = checks.filter(
    (check) => check.kind === "computed" && !check.passed
  ).length;

  return (
    <div className="grid grid-cols-1 items-start gap-x-3 gap-y-3 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_340px]">
      <ComposerPostList
        rows={props.rows}
        selectedPostId={props.post.id}
        header={props.campaignSwitcher}
      />
      <Panel
        title={`${props.post.kind === "post" ? "Post" : props.post.kind} · ${platform.label}`}
        aside={
          <span className="tabular-nums">
            {props.childPosts.length === 0
              ? "no replies"
              : `${props.childPosts.length} ${props.childPosts.length === 1 ? "reply" : "replies"}`}
          </span>
        }
      >
        <PostFieldsEditor
          postId={props.post.id}
          platformId={props.platformId}
          planned={
            props.post.variant !== "chatgpt" &&
            props.post.kind === "post" &&
            props.post.campaign_id !== null
          }
          hasOriginal={hasOriginal}
          scheduledAt={props.post.scheduled_at ?? undefined}
          draft={draft}
          copyText={copyText}
          onChange={(next) =>
            updateDraft({ postId: props.post.id, draft: next })
          }
        />
        {props.childPosts.length > 0 && (
          <ol className="flex flex-col border-t" aria-label="Replies">
            {props.childPosts.map((child, index) => {
              const childDraft = drafts[child.id] ?? toDraftFields(child);
              return (
                <ChildDraft
                  key={child.id}
                  index={index + 1}
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
                  dirty={isDirty}
                />
              );
            })}
          </ol>
        )}
        {canTakeReplies(props.post) && (
          <AddReplyButton postId={props.post.id} />
        )}
        <PostActions
          post={props.post}
          platformId={props.platformId}
          title={draft.title}
          copyText={copyText}
          link={draft.link}
          target={draft.target}
          originalRef={draft.originalRef}
          assets={draft.assets}
          dirty={isDirty}
          saving={isSaving}
          saveError={saveError}
          onSave={save}
        />
      </Panel>
      <div className="lg:sticky lg:top-3 lg:col-span-2 xl:col-span-1">
        <ChecksColumn
          tabs={[
            {
              id: "preflight",
              label:
                failedCount > 0
                  ? `Pre-flight · ${failedCount} to fix`
                  : `Pre-flight ${passedCount}/${computedChecks.length}`,
              content: (
                <PreflightPanel
                  platformLabel={platform.label}
                  checks={checks}
                />
              ),
            },
            {
              id: "voice",
              label: "Voice",
              content: (
                <VoiceCheckPanel
                  text={voiceText}
                  maxHashtags={platform.maxHashtags}
                />
              ),
            },
            {
              id: "chatgpt",
              label: "ChatGPT",
              content: (
                <ChatgptPanel
                  key={props.chatgptVariant?.id ?? "none"}
                  postId={props.post.id}
                  platformId={props.platformId}
                  copyText={copyText}
                  variant={props.chatgptVariant}
                  prompt={getChatgptPrompt({
                    campaignName: props.campaign.name,
                    makersNote: props.campaign.notes,
                    platformId: props.platformId,
                    title: hasTitle ? draft.title : "",
                    copyText,
                    target: draft.target,
                    assets: draft.assets,
                    original:
                      props.repostOf === undefined
                        ? undefined
                        : getPostCopyText({
                            body: props.repostOf.body,
                            hashtags: props.repostOf.hashtags,
                          }),
                  })}
                />
              ),
            },
            ...(props.platformId === "threads"
              ? [
                  {
                    id: "tags",
                    label: "Tags",
                    content: (
                      <CheckTagsPanel
                        hashtags={parseHashtags(draft.hashtagsText)}
                      />
                    ),
                  },
                ]
              : props.platformId === "x"
                ? [
                    {
                      id: "tags",
                      label: "Tags",
                      content: (
                        <XTagCheckPanel
                          hashtags={parseHashtags(draft.hashtagsText)}
                        />
                      ),
                    },
                  ]
                : []),
          ]}
        />
      </div>
    </div>
  );
}
