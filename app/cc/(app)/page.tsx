import sortBy from "lodash/sortBy.js";
import uniq from "lodash/uniq.js";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { checkVoice } from "@/lib/cc/check-voice";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listCampaignSummaries } from "@/lib/cc/data/list-campaign-summaries";
import { listCustomPosts } from "@/lib/cc/data/list-custom-posts";
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
import { PLATFORMS } from "@/lib/cc/platforms";

import { AlsoRunningStrip } from "./_overview/also-running-strip";
import { buildDueItems } from "./_overview/build-due-items";
import { buildRunSheet } from "./_overview/build-run-sheet";
import { CampaignClock } from "./_overview/campaign-clock";
import { DueNowPanel } from "./_overview/due-now-panel";
import { RunSheetPanel } from "./_overview/run-sheet-panel";
import { TopHashtagsPanel } from "./_overview/top-hashtags-panel";
import { TotalsStrip } from "./_overview/totals-strip";
import { ViewsByPlatformPanel } from "./_overview/views-by-platform-panel";
import { VoiceCheckPanel } from "./_overview/voice-check-panel";
import { CampaignPanel } from "./new/campaign-panel";

export default async function OverviewPage() {
  await requireCcOwner();
  const campaign = await getFocusedCampaign();
  if (campaign === undefined) {
    return (
      <>
        <PageHeader eyebrow="CAMPAIGN // NONE YET" title="Mission control" />
        <CampaignPanel campaign={undefined} />
      </>
    );
  }

  const now = new Date();
  const [posts, customPosts, reminders, summaries] = await Promise.all([
    listCampaignPosts({ campaignId: campaign.id, variant: "mine" }),
    listCustomPosts({ variant: "mine" }),
    listDueReminders({ now }),
    listCampaignSummaries(),
  ]);
  const timelinePosts = sortBy(
    [...posts, ...customPosts],
    (post) => post.scheduled_at === null,
    (post) => post.scheduled_at
  );
  const metrics = await listPostMetrics({
    postIds: posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts, metrics });
  const totals = getCampaignTotals(stats);
  const timelinePostIds = new Set(timelinePosts.map((post) => post.id));

  const mainPosts = posts.filter(
    (post) => post.kind === "post" && post.status !== "skipped"
  );
  const upcoming = timelinePosts.flatMap((post) =>
    post.status === "scheduled" &&
    post.scheduled_at !== null &&
    isPlatformId(post.platform) &&
    new Date(post.scheduled_at) > now
      ? [
          {
            atIso: post.scheduled_at,
            label: `${post.campaign_id === null ? `OTHER · ${post.project ?? ""} · ` : ""}${PLATFORMS[post.platform].label} · ${formatSgt({ date: new Date(post.scheduled_at), pattern: "EEE dd MMM HH:mm" })}`,
          },
        ]
      : []
  );
  const runSheet = buildRunSheet({ posts: timelinePosts, now });
  const dueItems = buildDueItems({
    reminders: reminders.filter((reminder) =>
      timelinePostIds.has(reminder.post_id)
    ),
    posts: timelinePosts,
    repostSuggestions: getRepostSuggestions(stats),
  });
  const voiceResults = timelinePosts.flatMap((post) => {
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
        name: [
          ...(post.campaign_id === null ? [post.project ?? ""] : []),
          getPostName(post) || PLATFORMS[post.platform].label,
        ].join(" · "),
        flagCount: flags.length,
        labels: uniq(flags.map((flag) => flag.label)),
      },
    ];
  });
  const flagged = voiceResults.filter((result) => result.flagCount > 0);

  return (
    <>
      <PageHeader
        eyebrow={`CAMPAIGN // ${campaign.name.toUpperCase()} + OTHER`}
        title="Mission control"
        aside={<CampaignClock upcoming={upcoming} />}
      />
      <AlsoRunningStrip
        campaigns={summaries.flatMap((summary) =>
          summary.isActive && summary.id !== campaign.id
            ? [
                {
                  id: summary.id,
                  name: summary.name,
                  code: summary.code,
                  color: summary.color,
                  nextLabel:
                    summary.nextPost === undefined
                      ? undefined
                      : `${isPlatformId(summary.nextPost.platform) ? PLATFORMS[summary.nextPost.platform].shortLabel : summary.nextPost.platform} · ${formatSgt({ date: new Date(summary.nextPost.at), pattern: "EEE HH:mm" })}`,
                },
              ]
            : []
        )}
      />
      <TotalsStrip
        postedCount={
          mainPosts.filter((post) => post.status === "posted").length
        }
        plannedCount={mainPosts.length}
        totals={totals}
      />
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 xl:grid-cols-[minmax(0,1fr)_400px]">
        <RunSheetPanel dayLabel={runSheet.dayLabel} items={runSheet.items} />
        <DueNowPanel items={dueItems} />
      </div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_400px]">
        <ViewsByPlatformPanel rows={totals.viewsByPlatform} />
        <TopHashtagsPanel lifts={getHashtagLift(stats)} />
        <VoiceCheckPanel
          cleanCount={voiceResults.length - flagged.length}
          flagged={flagged}
        />
      </div>
    </>
  );
}
