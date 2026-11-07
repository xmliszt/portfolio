"use client";

import { useEffect } from "react";

import { focusCampaign } from "@/app/cc/(app)/_actions/focus-campaign";

type SyncCampaignFocusProps = {
  campaignId: string;
};

export function SyncCampaignFocus(props: SyncCampaignFocusProps) {
  useEffect(() => {
    void focusCampaign({ campaignId: props.campaignId });
  }, [props.campaignId]);
  return null;
}
