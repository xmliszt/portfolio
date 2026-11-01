import uniq from "lodash/uniq.js";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { checkVoice } from "@/lib/cc/check-voice";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listDueReminders } from "@/lib/cc/data/list-due-reminders";
import { listPostMetrics } from "@/lib/cc/data/list-post-metrics";
import { toStatRows } from "@/lib/cc/data/to-stat-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getCampaignTotals } from "@/lib/cc/get-campaign-totals";
import { getHashtagLift } from "@/lib/cc/get-hashtag-lift";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { getPostName } from "@/lib/cc/get-post-name";
import { getRepostSuggestions } from "@/lib/cc/get-repost-suggestions";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parseCampaignPlan } from "@/lib/cc/parse-campaign-plan";
import { PLATFORMS } from "@/lib/cc/platforms";

import { buildDueItems } from "./_overview/build-due-items";
import { buildRunSheet } from "./_overview/build-run-sheet";
import { CampaignClock } from "./_overview/campaign-clock";
import { CampaignPanel } from "./_overview/campaign-panel";
import { CampaignPlanPanel } from "./_overview/campaign-plan-panel";
import { DueNowPanel } from "./_overview/due-now-panel";
import { getThreadsStatus } from "./_overview/get-threads-status";
import { IntegrationsPanel } from "./_overview/integrations-panel";
import { RunSheetPanel } from "./_overview/run-sheet-panel";
import { TopHashtagsPanel } from "./_overview/top-hashtags-panel";
import { TotalsStrip } from "./_overview/totals-strip";
import { ViewsByPlatformPanel } from "./_overview/views-by-platform-panel";
import { VoiceCheckPanel } from "./_overview/voice-check-panel";

export default async function OverviewPage() {
  await requireCcOwner();
  const [campaign, threadsStatus] = await Promise.all([
    getCurrentCampaign(),
    getThreadsStatus(),
  ]);
  if (campaign === undefined) {
    return (
      <>
        <PageHeader eyebrow="CAMPAIGN // NONE YET" title="Mission control" />
        <CampaignPanel campaign={undefined} />
        <IntegrationsPanel threads={threadsStatus} />
      </>
    );
  }

  const now = new Date();
  const [posts, reminders] = await Promise.all([
    listCampaignPosts({ campaignId: campaign.id, variant: "mine" }),
    listDueReminders({ now }),
  ]);
  const metrics = await listPostMetrics({
    postIds: posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts, metrics });
  const totals = getCampaignTotals(stats);
  const campaignPostIds = new Set(posts.map((post) => post.id));

  const mainPosts = posts.filter(
    (post) => post.kind === "post" && post.status !== "skipped"
  );
  const upcoming = posts.flatMap((post) =>
    post.status === "scheduled" &&
    post.scheduled_at !== null &&
    isPlatformId(post.platform) &&
    new Date(post.scheduled_at) > now
      ? [
          {
            atIso: post.scheduled_at,
            label: `${PLATFORMS[post.platform].shortLabel} ${formatSgt({ date: new Date(post.scheduled_at), pattern: "EEE dd MMM HH:mm" }).toUpperCase()}`,
          },
        ]
      : []
  );
  const runSheet = buildRunSheet({ posts, now });
  const dueItems = buildDueItems({
    reminders: reminders.filter((reminder) =>
      campaignPostIds.has(reminder.post_id)
    ),
    posts,
    repostSuggestions: getRepostSuggestions(stats),
  });
  const voiceResults = posts.flatMap((post) => {
    if (
      (post.status !== "scheduled" && post.status !== "draft") ||
      !isPlatformId(post.platform)
    ) {
      return [];
    }
    const flags = checkVoice({
      text: getPostCopyText({ body: post.body, hashtags: post.hashtags }),
      maxHashtags: PLATFORMS[post.platform].maxHashtags,
    });
    return [
      {
        postId: post.id,
        platformId: post.platform,
        name: getPostName(post) || PLATFORMS[post.platform].label,
        flagCount: flags.length,
        labels: uniq(flags.map((flag) => flag.label)),
      },
    ];
  });
  const flagged = voiceResults.filter((result) => result.flagCount > 0);

  return (
    <>
      <PageHeader
        eyebrow={`CAMPAIGN // ${campaign.name.toUpperCase()}`}
        title="Mission control"
        aside={<CampaignClock upcoming={upcoming} />}
      />
      <TotalsStrip
        postedCount={
          mainPosts.filter((post) => post.status === "posted").length
        }
        plannedCount={mainPosts.length}
        totals={totals}
      />
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <RunSheetPanel dayLabel={runSheet.dayLabel} items={runSheet.items} />
        <DueNowPanel items={dueItems} />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <ViewsByPlatformPanel rows={totals.viewsByPlatform} />
        <TopHashtagsPanel lifts={getHashtagLift(stats)} />
        <VoiceCheckPanel
          cleanCount={voiceResults.length - flagged.length}
          flagged={flagged}
        />
      </div>
      <CampaignPanel campaign={campaign} />
      <CampaignPlanPanel
        campaignId={campaign.id}
        plan={parseCampaignPlan(campaign.plan)}
      />
      <IntegrationsPanel threads={threadsStatus} />
    </>
  );
}
