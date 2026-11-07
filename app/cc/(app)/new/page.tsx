import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { buildScheduleContext } from "@/app/cc/(app)/calendar/build-schedule-context";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { listAllPosts } from "@/lib/cc/data/list-all-posts";
import { formatSgt } from "@/lib/cc/format-sgt";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parseCampaignPlan } from "@/lib/cc/parse-campaign-plan";

import { CampaignPanel } from "./campaign-panel";
import { CampaignPlanPanel } from "./campaign-plan-panel";
import { SchedulePostForm } from "./schedule-post-form";

export const metadata = { title: "New" };

type NewPageProps = {
  searchParams: Promise<{
    date?: string | string[];
    platform?: string | string[];
  }>;
};

export default async function NewPage(props: NewPageProps) {
  await requireCcOwner();
  const searchParams = await props.searchParams;
  const dateParam = searchParams.date;
  const platformParam = searchParams.platform;
  const campaign = await getFocusedCampaign();
  const allPosts = await listAllPosts({ variant: "mine" });
  const plan = parseCampaignPlan(campaign?.plan ?? null);

  return (
    <>
      <PageHeader
        eyebrow={
          campaign === undefined
            ? "CREATE // NO CAMPAIGN YET"
            : `CREATE // ${campaign.name.toUpperCase()}`
        }
        title="New"
      />
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 xl:grid-cols-2">
        <SchedulePostForm
          campaign={
            campaign === undefined
              ? undefined
              : {
                  id: campaign.id,
                  name: campaign.name,
                  link: campaign.link ?? undefined,
                }
          }
          defaultDate={
            typeof dateParam === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
              ? dateParam
              : formatSgt({ date: new Date(), pattern: "yyyy-MM-dd" })
          }
          defaultPlatformId={
            typeof platformParam === "string" && isPlatformId(platformParam)
              ? platformParam
              : "xiaohongshu"
          }
          schedule={buildScheduleContext({
            posts: allPosts,
            plan,
          })}
        />
        <CampaignPanel campaign={undefined} />
        <Panel
          title="Smart campaign"
          aside="CC plans the posts; ChatGPT writes them"
          className="xl:col-span-2"
          bodyClassName="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5"
        >
          <Link
            href="/campaigns/new"
            className="border-primary text-primary hover:bg-primary/10 flex h-7 items-center border px-2.5 text-[11px] font-semibold tracking-[0.04em]"
          >
            START SMART CAMPAIGN →
          </Link>
          <span className="text-muted-foreground text-[11px]">
            Fill in the product, kind, event day and platforms; CC builds a
            ChatGPT prompt and turns the reply into draft posts.
          </span>
        </Panel>
        {campaign !== undefined && (
          <div className="flex flex-col xl:col-span-2">
            <CampaignPlanPanel campaignId={campaign.id} plan={plan} />
          </div>
        )}
      </div>
    </>
  );
}
