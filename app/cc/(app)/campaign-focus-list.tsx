"use client";

import { useEffect, useTransition } from "react";
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
  const active = props.campaigns.filter((campaign) => campaign.isActive);
  const past = props.campaigns.filter((campaign) => !campaign.isActive);

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
      const ids = props.campaigns.map((campaign) => campaign.id);
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
      <div className="text-muted-foreground flex justify-between px-2 text-[10px] tracking-[0.06em]">
        <span>FOCUS</span>
        <span aria-hidden className="tracking-normal">
          [ ]
        </span>
      </div>
      <div className="flex flex-wrap gap-x-1 gap-y-0.5 md:flex-col">
        {active.map(renderItem)}
        {past.length > 0 && (
          <details
            open={past.some((campaign) => campaign.id === props.focusedId)}
            className="w-full"
          >
            <summary className="text-muted-foreground hover:text-foreground px-2 pt-1 text-[9.5px] tracking-[0.06em]">
              PAST · {past.length}
            </summary>
            <div className="flex flex-col gap-y-0.5 pt-0.5">
              {past.map(renderItem)}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
