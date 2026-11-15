"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { endCampaign } from "@/app/cc/(app)/_actions/end-campaign";

type EndCampaignControlProps = {
  campaignId: string;
  campaignName: string;
  unpostedCount: number;
};

export function EndCampaignControl(props: EndCampaignControlProps) {
  const [isPending, startTransition] = useTransition();
  const [hasFailed, setHasFailed] = useState(false);

  function end() {
    const posts =
      props.unpostedCount === 1
        ? "1 unposted post"
        : `${props.unpostedCount} unposted posts`;
    if (
      !window.confirm(
        `End ${props.campaignName}? Its ${posts} will be skipped and the rules job stops making reposts. Skipped posts stay skipped.`
      )
    ) {
      return;
    }
    setHasFailed(false);
    startTransition(async () => {
      try {
        await endCampaign({ campaignId: props.campaignId });
      } catch {
        setHasFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <CcButton
        type="button"
        variant="danger"
        disabled={isPending}
        onClick={end}
      >
        END CAMPAIGN
      </CcButton>
      <span className="text-muted-foreground text-[11px]">
        Skips every unposted post and draft. Moves it to PAST.
      </span>
      {hasFailed && (
        <span role="status" className="text-cc-warn text-[12px]">
          Could not end it. Try again.
        </span>
      )}
    </div>
  );
}
