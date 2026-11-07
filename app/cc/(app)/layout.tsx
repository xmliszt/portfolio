import { Suspense } from "react";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { listCampaignSummaries } from "@/lib/cc/data/list-campaign-summaries";
import { listDueReminders } from "@/lib/cc/data/list-due-reminders";
import { formatSgt } from "@/lib/cc/format-sgt";

import { getThreadsStatus } from "./settings/get-threads-status";
import { NavigationProgress } from "./navigation-progress";
import { SectionRail } from "./section-rail";

type CcAppLayoutProps = {
  children: React.ReactNode;
};

export default async function CcAppLayout(props: CcAppLayoutProps) {
  await requireCcOwner();
  const now = new Date();
  const [dueReminders, threadsStatus, campaigns, focused] = await Promise.all([
    listDueReminders({ now }),
    getThreadsStatus(),
    listCampaignSummaries({ now }),
    getFocusedCampaign(),
  ]);
  const dueLogCount = dueReminders.filter(
    (reminder) => reminder.kind === "log"
  ).length;
  const isTelegramLinked =
    process.env.CC_TELEGRAM_BOT_TOKEN !== undefined &&
    process.env.CC_TELEGRAM_CHAT_ID !== undefined;

  return (
    <div className="flex min-h-full flex-wrap">
      <Suspense>
        <NavigationProgress />
      </Suspense>
      <SectionRail
        dueLogCount={dueLogCount}
        telegramLinked={isTelegramLinked}
        campaigns={campaigns.map((campaign) => ({
          ...campaign,
          nextLabel:
            campaign.nextPost === undefined
              ? undefined
              : formatSgt({
                  date: new Date(campaign.nextPost.at),
                  pattern: "EEE HH:mm",
                }),
        }))}
        focusedCampaignId={focused?.id}
        settingsNeedAttention={
          threadsStatus.kind === "expired" ||
          threadsStatus.kind === "not-connected"
        }
      />
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-y-3 px-3 pt-3 pb-8">
        {props.children}
      </main>
    </div>
  );
}
