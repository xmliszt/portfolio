import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { ThemeControl } from "@/app/cc/_ui/theme-control";
import { CampaignPanel } from "@/app/cc/(app)/new/campaign-panel";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getBlueskyCredentials } from "@/lib/cc/bluesky/get-bluesky-credentials";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { formatSgt } from "@/lib/cc/format-sgt";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";

import { EndCampaignControl } from "./end-campaign-control";
import { getThreadsStatus } from "./get-threads-status";
import { IntegrationsPanel } from "./integrations-panel";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireCcOwner();
  const [campaign, threadsStatus] = await Promise.all([
    getFocusedCampaign(),
    getThreadsStatus(),
  ]);
  const { count: unpostedCount, error } =
    campaign === undefined
      ? { count: 0, error: null }
      : await createCcServiceClient()
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", campaign.id)
          .in("status", ["draft", "scheduled"]);
  if (error) throw error;
  const endedAt =
    campaign?.ended_at === null || (unpostedCount ?? 0) > 0
      ? undefined
      : campaign?.ended_at;

  return (
    <>
      <PageHeader eyebrow="CC // SETTINGS" title="Settings" />
      <Panel
        title="Appearance"
        aside="AUTO is light 07:00–19:00 SGT, dark otherwise"
        bodyClassName="flex items-center gap-x-3 px-3 py-2.5"
      >
        <ThemeControl />
      </Panel>
      <IntegrationsPanel
        threads={threadsStatus}
        xPosting={getXUserCredentials() !== undefined}
        blueskyPosting={getBlueskyCredentials() !== undefined}
      />
      {campaign !== undefined && <CampaignPanel campaign={campaign} />}
      {campaign !== undefined && (
        <Panel
          title="End campaign"
          aside={
            endedAt === undefined
              ? "Ended campaigns move to PAST under FOCUS"
              : undefined
          }
          bodyClassName="px-3 py-2.5"
        >
          {endedAt === undefined ? (
            <EndCampaignControl
              campaignId={campaign.id}
              campaignName={campaign.name}
              unpostedCount={unpostedCount ?? 0}
            />
          ) : (
            <span className="text-muted-foreground text-[12px]">
              Ended{" "}
              {formatSgt({
                date: new Date(endedAt),
                pattern: "EEE dd MMM HH:mm",
              })}{" "}
              SGT. The rules job makes no reposts for it.
            </span>
          )}
        </Panel>
      )}
    </>
  );
}
