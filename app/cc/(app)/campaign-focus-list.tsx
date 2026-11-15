"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

import { CampaignCodeChip } from "@/app/cc/_ui/campaign-code-chip";
import { focusCampaign } from "@/app/cc/(app)/_actions/focus-campaign";
import { confirmFocusChange } from "@/app/cc/(app)/confirm-focus-change";
import { getCampaignColorVar } from "@/lib/cc/get-campaign-color-var";
import type { CampaignSummary } from "@/lib/cc/summarise-campaigns";
import { cn } from "@/lib/utils";

type CampaignFocusListProps = {
  campaigns: readonly (CampaignSummary & { nextLabel: string | undefined })[];
  focusedId: string | undefined;
};

export function CampaignFocusList(props: CampaignFocusListProps) {
  const [isPending, startTransition] = useTransition();
  const isComposer = /^(\/cc)?\/composer(\/|$)/.test(usePathname());
  const isFocusedEnded = props.campaigns.some(
    (campaign) => campaign.id === props.focusedId && campaign.isEnded
  );
  const [show, setShow] = useState<"active" | "past">(
    isFocusedEnded ? "past" : "active"
  );
  const [wasFocusedEnded, setWasFocusedEnded] = useState(isFocusedEnded);
  if (isFocusedEnded !== wasFocusedEnded) {
    setWasFocusedEnded(isFocusedEnded);
    if (isFocusedEnded) setShow("past");
  }
  const current = props.campaigns.filter((campaign) => !campaign.isEnded);
  const past = props.campaigns.filter((campaign) => campaign.isEnded);
  const isShowingPast = show === "past" && past.length > 0;
  const shown = isShowingPast ? past : current;

  function focus(campaignId: string) {
    if (campaignId === props.focusedId || !confirmFocusChange()) return;
    startTransition(() =>
      focusCampaign({
        campaignId,
        redirectTo: isComposer ? "/composer" : undefined,
      })
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "[" && event.key !== "]") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select") !== null)
      ) {
        return;
      }
      const ids = shown.map((campaign) => campaign.id);
      if (ids.length < 2) return;
      const index = ids.findIndex((id) => id === props.focusedId);
      const step = event.key === "]" ? 1 : ids.length - 1;
      const nextId = ids.at((Math.max(index, 0) + step) % ids.length);
      if (nextId === undefined) return;
      focus(nextId);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (props.campaigns.length === 0) return null;

  function renderItem(campaign: CampaignFocusListProps["campaigns"][number]) {
    const isFocused = campaign.id === props.focusedId;
    const colorVar = getCampaignColorVar(campaign.color);
    return (
      <button
        key={campaign.id}
        type="button"
        aria-pressed={isFocused}
        onClick={() => focus(campaign.id)}
        style={
          isFocused
            ? {
                borderLeftColor: `hsl(var(${colorVar}))`,
                backgroundColor: `hsl(var(${colorVar}) / var(--cc-campaign-tint))`,
              }
            : undefined
        }
        className={cn(
          "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 border-l-2 border-transparent px-2 py-1 text-left",
          !isFocused && "hover:bg-cc-panel-2",
          !campaign.isActive && "opacity-60"
        )}
      >
        <CampaignCodeChip code={campaign.code} color={campaign.color} />
        <span
          className={cn(
            "truncate text-[11px]",
            isFocused ? "text-foreground font-semibold" : "text-cc-text-2"
          )}
        >
          {campaign.name}
        </span>
        <span className="text-muted-foreground col-start-2 truncate text-[10px] tabular-nums">
          {campaign.isActive
            ? `${campaign.upcomingCount} left · next ${campaign.nextLabel ?? "—"}`
            : campaign.isEnded
              ? "ended"
              : "nothing scheduled"}
        </span>
      </button>
    );
  }

  return (
    <div
      aria-label="Focus campaign"
      role="group"
      aria-busy={isPending}
      className={cn(
        "flex flex-col gap-y-1 border-y py-2",
        isPending && "opacity-70"
      )}
    >
      <div className="text-muted-foreground flex items-center justify-between px-2 text-[10px] tracking-[0.06em]">
        <span>FOCUS</span>
        <span aria-hidden className="tracking-normal">
          [ ]
        </span>
      </div>
      {past.length > 0 && (
        <div
          role="radiogroup"
          aria-label="Show campaigns"
          className="mx-2 grid grid-cols-2 border text-[9.5px] tracking-[0.06em]"
        >
          {(
            [
              { value: "active", label: `ACTIVE · ${current.length}` },
              { value: "past", label: `PAST · ${past.length}` },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={show === option.value}
              onClick={() => setShow(option.value)}
              className={cn(
                "h-5",
                show === option.value
                  ? "bg-cc-panel-2 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      <div
        className={cn(
          "flex flex-wrap gap-x-1 gap-y-0.5 md:flex-col",
          isShowingPast && "max-h-64 overflow-y-auto md:flex-nowrap"
        )}
      >
        {shown.map(renderItem)}
        {shown.length === 0 && (
          <span className="text-muted-foreground px-2 text-[10px]">
            No active campaigns
          </span>
        )}
      </div>
    </div>
  );
}
