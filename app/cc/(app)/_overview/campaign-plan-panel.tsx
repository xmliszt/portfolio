"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { applyCampaignPlan } from "@/app/cc/(app)/_actions/apply-campaign-plan";
import { previewCampaignPlan } from "@/app/cc/(app)/_actions/preview-campaign-plan";
import { saveCampaignPlan } from "@/app/cc/(app)/_actions/save-campaign-plan";
import type { CampaignPlan, DayAvailability } from "@/lib/cc/campaign-plan";
import { cn } from "@/lib/utils";

import type { PlanPreviewRow } from "./plan-preview-row";
import { PlanPreviewTable } from "./plan-preview-table";

type CampaignPlanPanelProps = {
  campaignId: string;
  plan: CampaignPlan;
};

type Preview = { plannedAt: string; rows: PlanPreviewRow[] };

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 25 }, (_, hour) => hour);

function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function CampaignPlanPanel(props: CampaignPlanPanelProps) {
  const [availability, setAvailability] = useState<readonly DayAvailability[]>(
    props.plan.availability
  );
  const [maxPerDay, setMaxPerDay] = useState(props.plan.maxPerDay);
  const [minGapMinutes, setMinGapMinutes] = useState(props.plan.minGapMinutes);
  const [startDate, setStartDate] = useState(props.plan.startDate ?? "");
  const [includeUserPlaced, setIncludeUserPlaced] = useState(false);
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const [status, setStatus] = useState<
    { kind: "done" | "error"; text: string } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();
  const movedCount =
    preview?.rows.filter((row) => row.kind === "moved").length ?? 0;

  function changeHour(options: {
    weekday: number;
    field: keyof DayAvailability;
    value: string;
  }) {
    setPreview(undefined);
    setAvailability(
      availability.map((day, weekday) =>
        weekday === options.weekday
          ? { ...day, [options.field]: Number(options.value) }
          : day
      )
    );
  }

  function run(action: () => Promise<string>) {
    setStatus(undefined);
    startTransition(async () => {
      try {
        setStatus({ kind: "done", text: await action() });
      } catch {
        setStatus({ kind: "error", text: "Could not plan. Try again." });
      }
    });
  }

  async function saveAndPreview() {
    const saved = await saveCampaignPlan({
      campaignId: props.campaignId,
      plan: {
        ...props.plan,
        availability,
        maxPerDay,
        minGapMinutes,
        startDate: startDate === "" ? undefined : startDate,
      },
    });
    setAvailability(saved.availability);
    setMaxPerDay(saved.maxPerDay);
    setMinGapMinutes(saved.minGapMinutes);
    setStartDate(saved.startDate ?? "");
    const next = await previewCampaignPlan({
      campaignId: props.campaignId,
      includeUserPlaced,
    });
    setPreview(next);
    return next;
  }

  function plan() {
    run(async () => {
      const next = await saveAndPreview();
      const count = next.rows.filter((row) => row.kind === "moved").length;
      return count === 0
        ? "Nothing to move."
        : `${count} ${count === 1 ? "post" : "posts"} would move.`;
    });
  }

  function apply() {
    if (preview === undefined) return;
    const plannedAt = preview.plannedAt;
    run(async () => {
      const result = await applyCampaignPlan({
        campaignId: props.campaignId,
        includeUserPlaced,
        plannedAt,
      });
      await saveAndPreview();
      return `Moved ${result.movedCount} ${result.movedCount === 1 ? "post" : "posts"}.`;
    });
  }

  return (
    <Panel
      title="Schedule planner"
      aside="SGT · posting stays manual"
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 lg:grid-cols-7">
        {availability.map((day, weekday) => (
          <fieldset key={WEEKDAYS[weekday]} className="flex flex-col gap-y-1.5">
            <legend className="text-muted-foreground mb-1.5 text-[10.5px] tracking-[0.04em] uppercase">
              {WEEKDAYS[weekday]}
              {day.fromHour >= day.toHour && " · OFF"}
            </legend>
            <select
              aria-label={`${WEEKDAYS[weekday]} from`}
              className="cc-input"
              value={day.fromHour}
              onChange={(event) =>
                changeHour({
                  weekday,
                  field: "fromHour",
                  value: event.target.value,
                })
              }
            >
              {HOURS.slice(0, 24).map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
            <select
              aria-label={`${WEEKDAYS[weekday]} to`}
              className="cc-input"
              value={day.toHour}
              onChange={(event) =>
                changeHour({
                  weekday,
                  field: "toHour",
                  value: event.target.value,
                })
              }
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        <CcField label="MAX POSTS PER DAY" htmlFor="plan-max-per-day">
          <input
            id="plan-max-per-day"
            type="number"
            min={1}
            max={10}
            className="cc-input w-24"
            value={maxPerDay}
            onChange={(event) => {
              setPreview(undefined);
              setMaxPerDay(Number(event.target.value));
            }}
          />
        </CcField>
        <CcField label="MIN GAP (MINUTES)" htmlFor="plan-min-gap">
          <input
            id="plan-min-gap"
            type="number"
            min={0}
            step={15}
            className="cc-input w-24"
            value={minGapMinutes}
            onChange={(event) => {
              setPreview(undefined);
              setMinGapMinutes(Number(event.target.value));
            }}
          />
        </CcField>
        <CcField label="START (SGT, EMPTY = TODAY)" htmlFor="plan-start">
          <input
            id="plan-start"
            type="date"
            className="cc-input"
            value={startDate}
            onChange={(event) => {
              setPreview(undefined);
              setStartDate(event.target.value);
            }}
          />
        </CcField>
        <label className="text-cc-text-2 flex min-h-7 items-center gap-x-2 text-[12px]">
          <input
            type="checkbox"
            checked={includeUserPlaced}
            onChange={(event) => {
              setPreview(undefined);
              setIncludeUserPlaced(event.target.checked);
            }}
          />
          Also move posts I placed by hand
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <CcButton type="button" onClick={plan} disabled={isPending}>
          {isPending ? "PLANNING…" : "PLAN SCHEDULE"}
        </CcButton>
        {preview !== undefined && (
          <CcButton
            type="button"
            variant="primary"
            onClick={apply}
            disabled={isPending || movedCount === 0}
          >
            APPLY
          </CcButton>
        )}
        {status !== undefined && (
          <span
            role="status"
            className={cn(
              "text-[12px]",
              status.kind === "done" ? "text-cc-ok" : "text-cc-warn"
            )}
          >
            {status.text}
          </span>
        )}
      </div>
      {preview !== undefined && preview.rows.length > 0 && (
        <PlanPreviewTable rows={preview.rows} />
      )}
    </Panel>
  );
}
