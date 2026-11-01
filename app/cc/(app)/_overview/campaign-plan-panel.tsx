"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { applyCampaignPlan } from "@/app/cc/(app)/_actions/apply-campaign-plan";
import { previewCampaignPlan } from "@/app/cc/(app)/_actions/preview-campaign-plan";
import { saveCampaignPlan } from "@/app/cc/(app)/_actions/save-campaign-plan";
import type { CampaignPlan, DayAvailability } from "@/lib/cc/campaign-plan";
import { cn } from "@/lib/utils";

import type { PlanPreviewRow } from "./plan-preview-row";

type CampaignPlanPanelProps = {
  campaignId: string;
  plan: CampaignPlan;
};

type Preview = { plannedAt: string; rows: PlanPreviewRow[] };

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 25 }, (_, hour) => hour);

const MARKERS = {
  moved: { label: "MOVED", className: "text-primary" },
  unchanged: { label: "SAME", className: "text-muted-foreground" },
  pinned: { label: "PINNED", className: "text-muted-foreground" },
  unplaced: { label: "NO SLOT", className: "text-cc-warn" },
} as const satisfies {
  [kind in PlanPreviewRow["kind"]]: { label: string; className: string };
};

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
      bodyClassName="flex flex-col gap-y-4 px-[18px] py-4"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 lg:grid-cols-7">
        {availability.map((day, weekday) => (
          <fieldset key={WEEKDAYS[weekday]} className="flex flex-col gap-y-1.5">
            <legend className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.14em]">
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
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
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
        <label className="text-cc-text-2 flex min-h-11 items-center gap-x-2 text-[12px]">
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="text-muted-foreground text-[11px] tracking-[0.1em]">
              <tr>
                <th className="py-2 pr-2 font-normal">POST</th>
                <th className="px-2 py-2 font-normal">WAVE</th>
                <th className="px-2 py-2 font-normal">CURRENT → PROPOSED</th>
                <th className="px-2 py-2 font-normal">WHY</th>
                <th className="py-2 pl-2 text-right font-normal">CHANGE</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row) => (
                <tr key={row.postId} className="border-cc-line-soft border-t">
                  <td className="py-2.5 pr-2">
                    <span className="flex items-center gap-x-2">
                      <PlatformChip platformId={row.platformId} />
                      <span className="text-cc-text-2 max-w-[260px] truncate">
                        {row.name}
                      </span>
                    </span>
                  </td>
                  <td className="text-muted-foreground px-2 py-2.5 tabular-nums">
                    {row.wave ?? "–"}
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap tabular-nums">
                    <span className="text-muted-foreground">
                      {row.currentLabel ?? "unscheduled"}
                    </span>
                    {row.proposedLabel !== undefined && (
                      <>
                        {" → "}
                        <span
                          className={cn(
                            row.kind === "moved" && "text-primary font-bold"
                          )}
                        >
                          {row.proposedLabel}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="text-cc-text-2 px-2 py-2.5 text-[12px]">
                    {row.reason}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pl-2 text-right text-[11px] tracking-[0.1em]",
                      MARKERS[row.kind].className
                    )}
                  >
                    {MARKERS[row.kind].label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
