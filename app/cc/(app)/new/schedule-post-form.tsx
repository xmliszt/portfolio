"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { CcSelect } from "@/app/cc/_ui/cc-select";
import { Panel } from "@/app/cc/_ui/panel";
import { savePost } from "@/app/cc/(app)/_actions/save-post";
import {
  ScheduleClashWarning,
  type ScheduleContext,
} from "@/app/cc/(app)/calendar/schedule-clash-warning";
import { SuggestSlotButton } from "@/app/cc/(app)/calendar/suggest-slot-button";
import type { AutoPublishPlatformId } from "@/lib/cc/auto-publish-platforms";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import {
  type Platform,
  PLATFORM_IDS,
  type PlatformId,
  PLATFORMS,
} from "@/lib/cc/platforms";
import { POST_TYPES, type PostType } from "@/lib/cc/post-types";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";
import { toPostKind } from "@/lib/cc/to-post-kind";
import { cn } from "@/lib/utils";

type SchedulePostFormProps = {
  campaign: { id: string; name: string; link: string | undefined } | undefined;
  defaultDate: string;
  defaultPlatformId: PlatformId;
  schedule: ScheduleContext;
};

type Result =
  | { kind: "idle" }
  | { kind: "created"; postId: string; status: "draft" | "scheduled" }
  | { kind: "failed"; message: string };

type Owner = "campaign" | "custom";

const POST_TYPE_LABELS: { [type in PostType]: string } = {
  post: "New post",
  reply: "Reply to a post",
  quote: "Quote a post",
  repost: "Repost (no text)",
};

const ORIGINAL_HINTS: { [platform in AutoPublishPlatformId]: string } = {
  x: "The post's x.com link.",
  threads: "A link to one of your last 50 threads.",
  bluesky: "The post's bsky.app link.",
};

export function SchedulePostForm(props: SchedulePostFormProps) {
  const [owner, setOwner] = useState<Owner>(
    props.campaign === undefined ? "custom" : "campaign"
  );
  const [project, setProject] = useState("");
  const [link, setLink] = useState("");
  const [platformId, setPlatformId] = useState<PlatformId>(
    props.defaultPlatformId
  );
  const [target, setTarget] = useState("");
  const [postType, setPostType] = useState<PostType>("post");
  const [originalRef, setOriginalRef] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(props.defaultDate);
  const [time, setTime] = useState("21:00");
  const [status, setStatus] = useState<"draft" | "scheduled">("scheduled");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const autoPlatformId = isAutoPublishPlatform(platformId)
    ? platformId
    : undefined;
  const type =
    owner === "custom" && autoPlatformId !== undefined ? postType : "post";
  const targetField: Platform["target"] =
    type === "reply" || type === "repost"
      ? undefined
      : PLATFORMS[platformId].target;

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ kind: "idle" });
    startTransition(async () => {
      try {
        const isCustom = owner === "custom";
        if (isCustom && project.trim() === "") {
          setResult({ kind: "failed", message: "Name the project first." });
          return;
        }
        if (type !== "post" && originalRef.trim() === "") {
          setResult({
            kind: "failed",
            message: "Paste the original post's link first.",
          });
          return;
        }
        const post = await savePost({
          campaignId: isCustom ? undefined : props.campaign?.id,
          fields: {
            platform: platformId,
            ...toPostKind(type),
            original_ref: type === "post" ? null : originalRef.trim(),
            target: targetField === undefined ? null : target.trim() || null,
            title: title.trim() || null,
            scheduled_at: sgtToUtc({ date, time }).toISOString(),
            status,
            link: isCustom
              ? link.trim() || null
              : (props.campaign?.link ?? null),
            project: isCustom ? project.trim() : null,
          },
        });
        setResult({ kind: "created", postId: post.id, status });
        setTitle("");
        setOriginalRef("");
      } catch {
        setResult({ kind: "failed", message: "Could not save. Try again." });
      }
    });
  }

  return (
    <Panel
      title="SCHEDULE POST"
      aside="TIMES IN SGT"
      bodyClassName="px-3 py-2.5"
    >
      <form id="schedule" onSubmit={create} className="flex flex-col gap-y-3.5">
        <div className="flex min-w-0 flex-col gap-y-1">
          <span
            id="schedule-owner-label"
            className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
          >
            FOR
          </span>
          <div
            role="group"
            aria-labelledby="schedule-owner-label"
            className="grid grid-cols-2 border"
          >
            {(["campaign", "custom"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={owner === option}
                disabled={option === "campaign" && props.campaign === undefined}
                onClick={() => {
                  setOwner(option);
                  setResult({ kind: "idle" });
                }}
                className={cn(
                  "flex h-7 min-w-0 items-center justify-center gap-x-1.5 px-2 text-[11px] font-semibold tracking-[0.04em] not-first:border-l disabled:opacity-50",
                  owner === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "custom" ? (
                  "OTHER POST"
                ) : (
                  <>
                    <span className="shrink-0">CAMPAIGN</span>
                    <span className="truncate font-normal">
                      {props.campaign === undefined
                        ? "· none yet"
                        : `· ${props.campaign.name}`}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-[11px]">
            {owner === "campaign"
              ? "Part of the campaign: planner, reminders and insights."
              : "A one-off post for another project. It shows on every screen with an OTHER chip and gets a Telegram reminder to post; no follow-up reminders or insights."}
          </p>
        </div>
        {owner === "custom" && (
          <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
            <CcField label="PROJECT" htmlFor="schedule-project">
              <input
                id="schedule-project"
                required
                className="cc-input"
                placeholder="e.g. Joodle"
                value={project}
                onChange={(event) => setProject(event.target.value)}
              />
            </CcField>
            <CcField label="LINK" htmlFor="schedule-link">
              <input
                id="schedule-link"
                type="url"
                className="cc-input"
                placeholder="https://… (optional)"
                value={link}
                onChange={(event) => setLink(event.target.value)}
              />
            </CcField>
          </div>
        )}
        <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
          <CcField label="PLATFORM" htmlFor="schedule-platform">
            <CcSelect
              id="schedule-platform"
              value={platformId}
              onChange={(next) => {
                setPlatformId(next);
                setResult({ kind: "idle" });
              }}
              options={PLATFORM_IDS.map((id) => ({
                value: id,
                label: PLATFORMS[id].label,
              }))}
            />
          </CcField>
          <CcField label="SAVE AS" htmlFor="schedule-status">
            <CcSelect
              id="schedule-status"
              value={status}
              onChange={setStatus}
              options={[
                {
                  value: "scheduled",
                  label:
                    owner === "campaign"
                      ? "Scheduled (reminders on)"
                      : "Scheduled (post reminder)",
                },
                {
                  value: "draft",
                  label: "Draft (no reminders)",
                },
              ]}
            />
          </CcField>
        </div>
        {owner === "custom" && autoPlatformId !== undefined && (
          <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
            <CcField label="TYPE" htmlFor="schedule-type">
              <CcSelect
                id="schedule-type"
                value={postType}
                onChange={(next) => {
                  setPostType(next);
                  setResult({ kind: "idle" });
                }}
                options={POST_TYPES.map((value) => ({
                  value,
                  label: POST_TYPE_LABELS[value],
                }))}
              />
            </CcField>
            {type !== "post" && (
              <CcField label="ORIGINAL POST" htmlFor="schedule-original">
                <input
                  id="schedule-original"
                  required
                  className="cc-input"
                  placeholder="https://… or post id"
                  value={originalRef}
                  onChange={(event) => setOriginalRef(event.target.value)}
                />
                <span className="text-muted-foreground text-[11px]">
                  {ORIGINAL_HINTS[autoPlatformId]}
                </span>
              </CcField>
            )}
          </div>
        )}
        {targetField !== undefined && (
          <CcField label={targetField.label} htmlFor="schedule-target">
            <input
              id="schedule-target"
              required={platformId === "reddit"}
              className="cc-input"
              placeholder={targetField.placeholder}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </CcField>
        )}
        <CcField label="TITLE" htmlFor="schedule-title">
          <input
            id="schedule-title"
            className="cc-input"
            placeholder="What this post is"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setResult({ kind: "idle" });
            }}
          />
        </CcField>
        <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
          <CcField label="DATE" htmlFor="schedule-date">
            <input
              id="schedule-date"
              type="date"
              required
              className="cc-input"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setResult({ kind: "idle" });
              }}
            />
          </CcField>
          <CcField label="TIME" htmlFor="schedule-time">
            <input
              id="schedule-time"
              type="time"
              required
              className="cc-input"
              value={time}
              onChange={(event) => {
                setTime(event.target.value);
                setResult({ kind: "idle" });
              }}
            />
          </CcField>
        </div>
        <ScheduleClashWarning
          at={sgtToUtc({ date, time })}
          postId={result.kind === "created" ? result.postId : undefined}
          schedule={props.schedule}
        />
        {props.campaign !== undefined && (
          <SuggestSlotButton
            key={platformId}
            campaignId={props.campaign.id}
            platformId={platformId}
            onSuggest={(slot) => {
              setDate(slot.date);
              setTime(slot.time);
              setResult({ kind: "idle" });
            }}
          />
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <CcButton type="submit" variant="primary" disabled={isPending}>
            {isPending ? "SAVING…" : "+ SCHEDULE POST"}
          </CcButton>
          {result.kind === "created" && (
            <span role="status" className="text-cc-ok text-[12px]">
              {result.status === "draft" ? "Draft saved. " : "Scheduled. "}
              <Link
                href={`/composer?post=${result.postId}`}
                className="text-primary"
              >
                Write the text in the composer →
              </Link>
            </span>
          )}
          {result.kind === "failed" && (
            <span role="alert" className="text-cc-warn text-[12px]">
              {result.message}
            </span>
          )}
        </div>
      </form>
    </Panel>
  );
}
