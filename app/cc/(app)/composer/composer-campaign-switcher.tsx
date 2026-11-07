"use client";

import { useTransition } from "react";

import { CampaignCodeChip } from "@/app/cc/_ui/campaign-code-chip";
import { OtherChip } from "@/app/cc/_ui/other-chip";
import { focusCampaign } from "@/app/cc/(app)/_actions/focus-campaign";
import { confirmFocusChange } from "@/app/cc/(app)/confirm-focus-change";
import { getCampaignColorVar } from "@/lib/cc/get-campaign-color-var";
import { cn } from "@/lib/utils";

type ComposerCampaignSwitcherProps = {
  campaigns: readonly {
    id: string;
    name: string;
    code: string;
    color: string;
    upcomingCount: number;
    isActive: boolean;
  }[];
  shownId: string;
};

export function ComposerCampaignSwitcher(props: ComposerCampaignSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const shown = props.campaigns.find(
    (campaign) => campaign.id === props.shownId
  );

  function show(campaignId: string) {
    if (campaignId === props.shownId || !confirmFocusChange()) return;
    startTransition(() =>
      focusCampaign({ campaignId, redirectTo: "/composer" })
    );
  }

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "flex flex-col gap-y-1.5 border-b px-2.5 py-2",
        isPending && "opacity-70"
      )}
    >
      <span className="text-muted-foreground text-[10px] tracking-[0.06em]">
        POSTS FOR
      </span>
      <div
        role="group"
        aria-label="Posts for campaign"
        className="bg-border grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-x-px gap-y-px border"
      >
        {props.campaigns.map((campaign) => {
          const isShown = campaign.id === props.shownId;
          const colorVar = getCampaignColorVar(campaign.color);
          return (
            <button
              key={campaign.id}
              type="button"
              aria-pressed={isShown}
              aria-label={campaign.name}
              title={campaign.name}
              onClick={() => show(campaign.id)}
              style={
                isShown
                  ? {
                      backgroundColor: `color-mix(in srgb, hsl(var(${colorVar})) 16%, hsl(var(--card)))`,
                      boxShadow: `inset 0 -2px 0 hsl(var(${colorVar}))`,
                    }
                  : undefined
              }
              className="bg-card hover:bg-cc-panel-2 group flex h-[26px] items-center justify-center"
            >
              <CampaignCodeChip
                code={campaign.code}
                color={campaign.color}
                className={cn(!isShown && "opacity-55 group-hover:opacity-100")}
              />
            </button>
          );
        })}
      </div>
      {shown !== undefined && (
        <div className="flex min-w-0 justify-between gap-x-2 text-[11px]">
          <span className="truncate font-semibold">{shown.name}</span>
          <span className="text-muted-foreground shrink-0 tabular-nums">
            {shown.isActive ? `${shown.upcomingCount} left` : "past"}
          </span>
        </div>
      )}
      <span className="text-muted-foreground flex items-center gap-x-1.5 text-[10px]">
        <OtherChip />
        always listed
      </span>
    </div>
  );
}
