import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { ThemeControl } from "@/app/cc/_ui/theme-control";
import { CampaignPanel } from "@/app/cc/(app)/new/campaign-panel";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getBlueskyCredentials } from "@/lib/cc/bluesky/get-bluesky-credentials";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";

import { getThreadsStatus } from "./get-threads-status";
import { IntegrationsPanel } from "./integrations-panel";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireCcOwner();
  const [campaign, threadsStatus] = await Promise.all([
    getFocusedCampaign(),
    getThreadsStatus(),
  ]);

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
    </>
  );
}
