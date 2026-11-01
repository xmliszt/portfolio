"use client";

import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual.js";
import uniq from "lodash/uniq.js";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { parseHashtags } from "@/app/cc/(app)/composer/parse-hashtags";
import { PLATFORM_PREFLIGHT } from "@/app/cc/(app)/composer/platform-preflight";
import { buildSmartCampaignPlan } from "@/lib/cc/build-smart-campaign-plan";
import { buildSmartCampaignPrompt } from "@/lib/cc/build-smart-campaign-prompt";
import type { CampaignKind } from "@/lib/cc/campaign-plan";
import { getLinkHost } from "@/lib/cc/get-link-host";
import { getRepostGaps } from "@/lib/cc/get-repost-gaps";
import {
  matchSmartCampaignReply,
  type SmartCampaignDraft,
} from "@/lib/cc/match-smart-campaign-reply";
import { parseSmartCampaignResponse } from "@/lib/cc/parse-smart-campaign-response";
import { parseStoredSmartCampaign } from "@/lib/cc/parse-stored-smart-campaign";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type {
  SmartCampaignEdit,
  SmartCampaignForm,
  SmartCampaignState,
} from "@/lib/cc/smart-campaign-state";
import {
  type CampaignHistoryPost,
  summariseCampaignHistory,
} from "@/lib/cc/summarise-campaign-history";

import { SmartCampaignCreatePanel } from "./smart-campaign-create-panel";
import { SmartCampaignDraftCard } from "./smart-campaign-draft-card";
import { SmartCampaignFormPanel } from "./smart-campaign-form-panel";
import { SmartCampaignPromptPanel } from "./smart-campaign-prompt-panel";

type SmartCampaignProps = {
  defaultForm: SmartCampaignForm;
  history: readonly CampaignHistoryPost[];
  current: { name: string; startDate: string | undefined } | undefined;
};

const STORAGE_KEY = "cc:smart-campaign";

const NAME_SUFFIX = {
  launch: "launch",
  "follow-up": "follow-up",
  "feature-update": "update",
  event: "event",
} as const satisfies { [kind in CampaignKind]: string };

function toEdit(draft: SmartCampaignDraft): SmartCampaignEdit {
  return {
    title: draft.title ?? "",
    body: draft.body,
    hashtags: draft.hashtags.map((tag) => `#${tag}`).join(" "),
    target: draft.target ?? "",
  };
}

function applyEdit(options: {
  draft: SmartCampaignDraft;
  edit: SmartCampaignEdit;
}): SmartCampaignDraft {
  const title = options.edit.title.trim();
  const target = options.edit.target.trim();
  return {
    ...options.draft,
    title: title === "" ? undefined : title,
    body: options.edit.body.trim(),
    hashtags: parseHashtags(options.edit.hashtags),
    target: target === "" ? undefined : target,
  };
}

function getEmptyState(form: SmartCampaignForm): SmartCampaignState {
  return {
    form,
    promptForm: undefined,
    reply: "",
    edits: {},
    removedRefs: [],
    createdCampaignId: undefined,
  };
}

function buildPrompt(options: {
  form: SmartCampaignForm;
  history: readonly CampaignHistoryPost[];
}) {
  const form = options.form;
  const host = getLinkHost(form.link);
  const posts = options.history.filter(
    (post) => host !== undefined && post.host === host
  );
  const repostGaps =
    form.startDate === ""
      ? []
      : getRepostGaps({
          posts,
          platformIds: form.platformIds,
          startDate: form.startDate,
          lengthDays: form.lengthDays,
        });
  const eventDate =
    form.kind === "event" && form.eventDate !== "" ? form.eventDate : undefined;
  const plan = buildSmartCampaignPlan({
    kind: form.kind,
    eventDate,
    platforms: form.platformIds.map((platformId) => ({
      platformId,
      language: form.languages[platformId],
    })),
    media: form.media,
    repostGaps,
  });
  const skippedIds = new Set(plan.skipped.map((entry) => entry.platformId));
  return {
    plan,
    readyOn: Object.fromEntries(
      repostGaps.flatMap((gap) =>
        gap.kind === "no-history" || skippedIds.has(gap.platformId)
          ? []
          : [[gap.platformId, gap.readyOn]]
      )
    ) satisfies { [id in PlatformId]?: string },
    prompt: buildSmartCampaignPrompt({
      kind: form.kind,
      intent: form.intent,
      eventDate,
      product: { name: form.name, link: form.link },
      thoughts: form.thoughts,
      makersNote: form.makersNote,
      earlierPosts: form.earlierPosts,
      history: summariseCampaignHistory({
        posts,
        platformIds: form.platformIds,
      }),
      startDate: form.startDate,
      lengthDays: form.lengthDays,
      media: form.media,
      plan,
      repostGaps,
      preflight: PLATFORM_PREFLIGHT,
    }),
  };
}

export function SmartCampaign(props: SmartCampaignProps) {
  const [state, setState] = useState(() => getEmptyState(props.defaultForm));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setState(
          parseStoredSmartCampaign({
            value: JSON.parse(stored),
            defaultForm: props.defaultForm,
          })
        );
      }
    } catch {
      setState(getEmptyState(props.defaultForm));
    }
    setIsLoaded(true);
  }, [isLoaded, props.defaultForm]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      return;
    }
  }, [isLoaded, state]);

  const form = state.form;
  const generated =
    state.promptForm === undefined
      ? undefined
      : buildPrompt({ form: state.promptForm, history: props.history });
  const parsed =
    state.reply.trim() === ""
      ? undefined
      : parseSmartCampaignResponse(state.reply);
  const match =
    generated === undefined || parsed?.kind !== "ok"
      ? undefined
      : matchSmartCampaignReply({
          slots: generated.plan.slots,
          posts: parsed.posts,
        });
  const removed = new Set(state.removedRefs);
  const kept = (match?.drafts ?? []).filter(
    (draft) =>
      !removed.has(draft.ref) &&
      (draft.parentRef === undefined || !removed.has(draft.parentRef))
  );
  const drafts = kept
    .map((draft) =>
      applyEdit({ draft, edit: state.edits[draft.ref] ?? toEdit(draft) })
    )
    .filter((draft) => draft.body !== "");
  const missingFields = [
    form.name.trim() === "" ? "product name" : undefined,
    form.thoughts.trim() === "" ? "how you think about it" : undefined,
    form.platformIds.length === 0 ? "a platform" : undefined,
    form.startDate === "" ? "a start date" : undefined,
    form.kind !== "launch" && form.intent.trim() === ""
      ? "what this campaign should focus on"
      : undefined,
    form.kind === "event" &&
    (form.eventDate === "" || form.eventDate <= form.startDate)
      ? "an event day after the start"
      : undefined,
  ].filter((field) => field !== undefined);
  const promptForm = state.promptForm ?? form;
  const productName = promptForm.name.trim();
  const isCreated = state.createdCampaignId !== undefined;
  const defaultName =
    parsed?.kind === "ok" && parsed.campaign.name !== undefined
      ? parsed.campaign.name
      : `${productName} ${NAME_SUFFIX[promptForm.kind]}`;
  const previewPlatformIds = uniq([
    ...(state.promptForm?.platformIds ?? []),
    ...kept.map((draft) => draft.platformId),
  ]);

  function update(fields: Partial<SmartCampaignState>) {
    setState((previous) => ({ ...previous, ...fields }));
  }

  function changeReply(reply: string) {
    const hasChanges =
      Object.keys(state.edits).length > 0 || state.removedRefs.length > 0;
    if (
      hasChanges &&
      !window.confirm(
        "Changing the reply drops your edits and removals. Go on?"
      )
    ) {
      return;
    }
    update({ reply, edits: {}, removedRefs: [] });
  }

  function generate() {
    update({ promptForm: form });
  }

  function startOver() {
    if (!window.confirm("Clear this smart campaign and start again?")) return;
    setState(getEmptyState(props.defaultForm));
  }

  return (
    <>
      <SmartCampaignFormPanel
        form={form}
        current={props.current}
        onChange={(next) => update({ form: next })}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <CcButton
          type="button"
          variant="primary"
          onClick={generate}
          disabled={missingFields.length > 0}
        >
          GENERATE PROMPT
        </CcButton>
        <CcButton type="button" variant="warn" onClick={startOver}>
          START OVER
        </CcButton>
        {missingFields.length > 0 && (
          <span className="text-muted-foreground text-[12px]">
            Needs {missingFields.join(", ")}.
          </span>
        )}
      </div>
      {generated !== undefined && (
        <SmartCampaignPromptPanel
          prompt={generated.prompt}
          plan={generated.plan}
          isStale={!isEqual(state.promptForm, form)}
        />
      )}
      {generated !== undefined && !isCreated && (
        <Panel
          title="ChatGPT's reply"
          aside="Paste the whole reply; CC finds the JSON"
          className="flex-[1_1_100%]"
          bodyClassName="flex flex-col gap-y-3 px-[18px] py-4"
        >
          <textarea
            aria-label="ChatGPT's reply"
            rows={8}
            className="cc-input resize-y font-mono text-[12px]"
            value={state.reply}
            onChange={(event) => changeReply(event.target.value)}
          />
          {parsed?.kind === "error" && (
            <p role="alert" className="text-cc-warn text-[12px]">
              {parsed.message}
            </p>
          )}
          {parsed?.kind === "ok" && match !== undefined && (
            <div className="flex flex-col gap-y-1.5 text-[12px]">
              <p className="text-cc-ok">
                Read {parsed.posts.length} posts
                {parsed.campaign.tagline === undefined
                  ? "."
                  : `. Tagline: ${parsed.campaign.tagline}`}
              </p>
              {match.missingRefs.length > 0 && (
                <p className="text-cc-warn">
                  Missing from the reply: {match.missingRefs.join(", ")}
                </p>
              )}
              {match.extraRefs.length > 0 && (
                <p className="text-cc-warn">
                  Not in the plan: {match.extraRefs.join(", ")}
                </p>
              )}
              {parsed.warnings.map((warning) => (
                <p key={warning} className="text-cc-warn">
                  {warning}
                </p>
              ))}
              {state.removedRefs.length > 0 && (
                <p className="text-muted-foreground">
                  Removed: {state.removedRefs.join(", ")}{" "}
                  <button
                    type="button"
                    className="text-primary min-h-11 hover:underline"
                    onClick={() => update({ removedRefs: [] })}
                  >
                    RESTORE
                  </button>
                </p>
              )}
            </div>
          )}
        </Panel>
      )}
      {generated !== undefined &&
        !isCreated &&
        previewPlatformIds.map((platformId) => {
          const platformDrafts = kept.filter(
            (draft) => draft.platformId === platformId
          );
          if (platformDrafts.length === 0) return undefined;
          const waves = [...new Set(platformDrafts.map((draft) => draft.wave))];
          return (
            <Panel
              key={platformId}
              title={PLATFORMS[platformId].label}
              aside={`${platformDrafts.length} to create`}
              className="flex-[1_1_100%]"
              bodyClassName="flex flex-col gap-y-4 px-[18px] py-4"
            >
              {waves.map((wave) => (
                <section
                  key={wave ?? "none"}
                  aria-label={`Wave ${wave ?? "none"}`}
                  className="flex flex-col gap-y-2"
                >
                  <h3 className="text-muted-foreground text-[11px] tracking-[0.14em]">
                    {generated.plan.waves
                      .find((entry) => entry.wave === wave)
                      ?.title.toUpperCase() ?? `WAVE ${wave ?? "–"}`}
                  </h3>
                  {platformDrafts
                    .filter((draft) => draft.wave === wave)
                    .map((draft) => (
                      <SmartCampaignDraftCard
                        key={draft.ref}
                        draft={draft}
                        edit={state.edits[draft.ref] ?? toEdit(draft)}
                        onEdit={(edit) =>
                          setState((previous) => ({
                            ...previous,
                            edits: { ...previous.edits, [draft.ref]: edit },
                          }))
                        }
                        onRemove={() =>
                          setState((previous) => ({
                            ...previous,
                            removedRefs: [...previous.removedRefs, draft.ref],
                          }))
                        }
                      />
                    ))}
                </section>
              ))}
            </Panel>
          );
        })}
      {(isCreated || (match !== undefined && drafts.length > 0)) && (
        <SmartCampaignCreatePanel
          key={defaultName}
          form={{
            ...promptForm,
            link: form.link,
            makersNote: form.makersNote,
            startDate: form.startDate,
            lengthDays: form.lengthDays,
          }}
          defaultName={defaultName}
          drafts={drafts}
          notBefore={generated?.readyOn ?? {}}
          missingCount={match?.missingRefs.length ?? 0}
          createdCampaignId={state.createdCampaignId}
          onCreated={(campaignId) => update({ createdCampaignId: campaignId })}
        />
      )}
    </>
  );
}
