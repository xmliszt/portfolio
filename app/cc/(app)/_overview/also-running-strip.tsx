"use client";

import { useTransition } from "react";

import { CampaignCodeChip } from "@/app/cc/_ui/campaign-code-chip";
import { focusCampaign } from "@/app/cc/(app)/_actions/focus-campaign";

type AlsoRunningStripProps = {
  campaigns: readonly {
    id: string;
    name: string;
    code: string;
    color: string;
    nextLabel: string | undefined;
  }[];
};

export function AlsoRunningStrip(props: AlsoRunningStripProps) {
  const [isPending, startTransition] = useTransition();
  if (props.campaigns.length === 0) return null;

  return (
    <div
      aria-label="Also running"
      aria-busy={isPending}
      className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
    >
      <span className="text-muted-foreground text-[10.5px] tracking-[0.06em] uppercase">
        Also running
      </span>
      {props.campaigns.map((campaign) => (
        <button
          key={campaign.id}
          type="button"
          title={`Focus ${campaign.name}`}
          onClick={() =>
            startTransition(() => focusCampaign({ campaignId: campaign.id }))
          }
          className="bg-card text-cc-text-2 hover:border-primary hover:text-foreground flex h-7 items-center gap-x-1.5 border px-2 text-[11px] whitespace-nowrap tabular-nums"
        >
          <CampaignCodeChip code={campaign.code} color={campaign.color} />
          {campaign.nextLabel ?? "nothing scheduled"}
        </button>
      ))}
    </div>
  );
}
