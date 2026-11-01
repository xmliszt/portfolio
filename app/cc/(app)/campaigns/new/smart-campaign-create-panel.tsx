"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { applyCampaignPlan } from "@/app/cc/(app)/_actions/apply-campaign-plan";
import { createSmartCampaign } from "@/app/cc/(app)/_actions/create-smart-campaign";
import { previewCampaignPlan } from "@/app/cc/(app)/_actions/preview-campaign-plan";
import type { PlanPreviewRow } from "@/app/cc/(app)/_overview/plan-preview-row";
import { PlanPreviewTable } from "@/app/cc/(app)/_overview/plan-preview-table";
import type { SmartCampaignDraft } from "@/lib/cc/match-smart-campaign-reply";
import type { PlatformId } from "@/lib/cc/platforms";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";
import type { SmartCampaignForm } from "@/lib/cc/smart-campaign-state";
import { cn } from "@/lib/utils";

type SmartCampaignCreatePanelProps = {
  form: SmartCampaignForm;
  defaultName: string;
  drafts: readonly SmartCampaignDraft[];
  notBefore: { [id in PlatformId]?: string };
  missingCount: number;
  createdCampaignId: string | undefined;
  onCreated: (campaignId: string) => void;
};

type Preview = { plannedAt: string; rows: PlanPreviewRow[] };

const DAY_MS = 24 * 60 * 60 * 1000;

export function SmartCampaignCreatePanel(props: SmartCampaignCreatePanelProps) {
  const [name, setName] = useState(props.defaultName);
  const [notes, setNotes] = useState<string[]>([]);
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const [status, setStatus] = useState<
    { kind: "done" | "error"; text: string } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();
  const campaignId = props.createdCampaignId;
  const windowEnd =
    props.form.startDate === ""
      ? undefined
      : new Date(
          sgtToUtc({ date: props.form.startDate, time: "00:00" }).getTime() +
            props.form.lengthDays * DAY_MS
        );
  const lateCount =
    windowEnd === undefined
      ? 0
      : (preview?.rows.filter(
          (row) =>
            row.proposedAt !== undefined &&
            new Date(row.proposedAt) >= windowEnd
        ).length ?? 0);
  const pinnedCount =
    preview?.rows.filter((row) => row.kind === "pinned").length ?? 0;
  const movedCount =
    preview?.rows.filter((row) => row.kind === "moved").length ?? 0;

  function run(action: () => Promise<string>) {
    setStatus(undefined);
    startTransition(async () => {
      try {
        setStatus({ kind: "done", text: await action() });
      } catch {
        setStatus({ kind: "error", text: "Something failed. Try again." });
      }
    });
  }

  async function loadPreview(id: string) {
    const next = await previewCampaignPlan({
      campaignId: id,
      includeUserPlaced: false,
    });
    setPreview(next);
    return next;
  }

  function create() {
    run(async () => {
      const result = await createSmartCampaign({
        name,
        link: props.form.link,
        makersNote: props.form.makersNote,
        startDate: props.form.startDate,
        kind: props.form.kind,
        intent: props.form.intent,
        eventDate:
          props.form.kind === "event" && props.form.eventDate !== ""
            ? props.form.eventDate
            : undefined,
        notBefore: props.notBefore,
        drafts: props.drafts,
      });
      props.onCreated(result.campaignId);
      const kitSource = result.kitSource;
      const mediaNote = (() => {
        switch (kitSource.kind) {
          case "kit":
            return result.withoutMediaRefs.length === 0
              ? `Media taken from the ${kitSource.campaignName} kit.`
              : `Media taken from the ${kitSource.campaignName} kit; no matching file for ${result.withoutMediaRefs.join(", ")}. Attach it in the Composer.`;
          case "other-host":
            return `No media attached: ${kitSource.campaignName} is for another site. Upload the kit and attach it in the Composer.`;
          case "no-link":
            return "No media attached: the product link is empty or not a full URL. Attach media in the Composer.";
          case "no-current":
            return "No media attached: there is no earlier campaign kit. Attach media in the Composer.";
          default: {
            const unhandled: never = kitSource;
            return unhandled;
          }
        }
      })();
      setNotes([
        mediaNote,
        ...(result.orphanRefs.length > 0
          ? [
              `Left out ${result.orphanRefs.join(", ")}: the post they belong to was removed or missing.`,
            ]
          : []),
      ]);
      await loadPreview(result.campaignId);
      return `Created with ${result.postCount} draft posts.`;
    });
  }

  function plan(id: string) {
    run(async () => {
      const next = await loadPreview(id);
      const count = next.rows.filter((row) => row.kind === "moved").length;
      return `${count} ${count === 1 ? "post" : "posts"} would be scheduled.`;
    });
  }

  function apply(id: string) {
    if (preview === undefined) return;
    const plannedAt = preview.plannedAt;
    run(async () => {
      const result = await applyCampaignPlan({
        campaignId: id,
        includeUserPlaced: false,
        plannedAt,
      });
      await loadPreview(id);
      return `Scheduled ${result.movedCount} ${result.movedCount === 1 ? "post" : "posts"}.`;
    });
  }

  return (
    <Panel
      title={campaignId === undefined ? "Create campaign" : "Schedule"}
      aside="Posts start as drafts; Apply schedules them"
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-4 px-[18px] py-4"
    >
      {campaignId === undefined ? (
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <div className="min-w-[240px] flex-1">
            <CcField label="CAMPAIGN NAME" htmlFor="smart-campaign-name">
              <input
                id="smart-campaign-name"
                className="cc-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </CcField>
          </div>
          <CcButton
            type="button"
            variant="primary"
            onClick={create}
            disabled={
              isPending ||
              name.trim() === "" ||
              props.form.startDate === "" ||
              props.drafts.length === 0
            }
          >
            {isPending
              ? "CREATING…"
              : `CREATE CAMPAIGN · ${props.drafts.length} POSTS`}
          </CcButton>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <CcButton
            type="button"
            onClick={() => plan(campaignId)}
            disabled={isPending}
          >
            {isPending ? "PLANNING…" : "PLAN SCHEDULE"}
          </CcButton>
          {preview !== undefined && (
            <CcButton
              type="button"
              variant="primary"
              onClick={() => apply(campaignId)}
              disabled={isPending || movedCount === 0}
            >
              APPLY
            </CcButton>
          )}
          <Link href="/" className="text-primary text-[12px] hover:underline">
            OVERVIEW →
          </Link>
          <Link
            href="/calendar"
            className="text-primary text-[12px] hover:underline"
          >
            CALENDAR →
          </Link>
        </div>
      )}
      {campaignId === undefined && props.missingCount > 0 && (
        <p className="text-cc-warn text-[12px]">
          {props.missingCount} planned{" "}
          {props.missingCount === 1 ? "post is" : "posts are"} missing from the
          reply. You can create the campaign without them.
        </p>
      )}
      {campaignId === undefined && props.form.startDate === "" && (
        <p className="text-cc-warn text-[12px]">Pick a start date first.</p>
      )}
      {status !== undefined && (
        <p
          role="status"
          className={cn(
            "text-[12px]",
            status.kind === "done" ? "text-cc-ok" : "text-cc-warn"
          )}
        >
          {status.text}
        </p>
      )}
      {notes.map((note) => (
        <p key={note} className="text-muted-foreground text-[12px]">
          {note}
        </p>
      ))}
      {preview !== undefined && preview.rows.length > 0 && (
        <>
          <PlanPreviewTable rows={preview.rows} />
          {lateCount > 0 && windowEnd !== undefined && (
            <p className="text-cc-warn text-[12px]">
              {lateCount} {lateCount === 1 ? "post lands" : "posts land"} after
              the {props.form.lengthDays}-day window. Raise the max posts per
              day in the Schedule planner on the Overview, then plan again.
            </p>
          )}
          {pinnedCount > 0 && (
            <p className="text-muted-foreground text-[12px]">
              Product Hunt and YouTube posts stay unscheduled: set their times
              in the Calendar.
            </p>
          )}
        </>
      )}
    </Panel>
  );
}
