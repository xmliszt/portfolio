"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { savePost } from "@/app/cc/(app)/_actions/save-post";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import {
  type Platform,
  PLATFORM_IDS,
  type PlatformId,
  PLATFORMS,
} from "@/lib/cc/platforms";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

import {
  ScheduleClashWarning,
  type ScheduleContext,
} from "./schedule-clash-warning";
import { SuggestSlotButton } from "./suggest-slot-button";

type SchedulePostFormProps = {
  campaignId: string;
  campaignLink: string | undefined;
  defaultDate: string;
  defaultPlatformId: PlatformId;
  schedule: ScheduleContext;
};

type Result =
  | { kind: "idle" }
  | { kind: "created"; postId: string; status: "draft" | "scheduled" }
  | { kind: "failed" };

export function SchedulePostForm(props: SchedulePostFormProps) {
  const [platformId, setPlatformId] = useState<PlatformId>(
    props.defaultPlatformId
  );
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(props.defaultDate);
  const [time, setTime] = useState("21:00");
  const [status, setStatus] = useState<"draft" | "scheduled">("scheduled");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const targetField: Platform["target"] = PLATFORMS[platformId].target;

  function changePlatform(event: React.ChangeEvent<HTMLSelectElement>) {
    if (isPlatformId(event.target.value)) setPlatformId(event.target.value);
  }

  function changeStatus(event: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(event.target.value === "draft" ? "draft" : "scheduled");
  }

  function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ kind: "idle" });
    startTransition(async () => {
      try {
        const post = await savePost({
          campaignId: props.campaignId,
          fields: {
            platform: platformId,
            kind: "post",
            target: targetField === undefined ? null : target.trim() || null,
            title: title.trim() || null,
            scheduled_at: sgtToUtc({ date, time }).toISOString(),
            status,
            link: props.campaignLink ?? null,
          },
        });
        setResult({ kind: "created", postId: post.id, status });
        setTitle("");
      } catch {
        setResult({ kind: "failed" });
      }
    });
  }

  return (
    <Panel
      title="SCHEDULE POST"
      aside="TIMES IN SGT"
      className="flex-[1_1_360px]"
      bodyClassName="px-[18px] py-4"
    >
      <form id="schedule" onSubmit={create} className="flex flex-col gap-y-3.5">
        <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
          <CcField label="PLATFORM" htmlFor="schedule-platform">
            <select
              id="schedule-platform"
              className="cc-input"
              value={platformId}
              onChange={changePlatform}
            >
              {PLATFORM_IDS.map((id) => (
                <option key={id} value={id}>
                  {PLATFORMS[id].label}
                </option>
              ))}
            </select>
          </CcField>
          <CcField label="SAVE AS" htmlFor="schedule-status">
            <select
              id="schedule-status"
              className="cc-input"
              value={status}
              onChange={changeStatus}
            >
              <option value="scheduled">Scheduled (reminders on)</option>
              <option value="draft">Draft (no reminders)</option>
            </select>
          </CcField>
        </div>
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
            onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setDate(event.target.value)}
            />
          </CcField>
          <CcField label="TIME" htmlFor="schedule-time">
            <input
              id="schedule-time"
              type="time"
              required
              className="cc-input"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </CcField>
        </div>
        <ScheduleClashWarning
          at={sgtToUtc({ date, time })}
          postId={undefined}
          schedule={props.schedule}
        />
        <SuggestSlotButton
          key={platformId}
          campaignId={props.campaignId}
          platformId={platformId}
          onSuggest={(slot) => {
            setDate(slot.date);
            setTime(slot.time);
          }}
        />
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
              Could not save. Try again.
            </span>
          )}
        </div>
      </form>
    </Panel>
  );
}
