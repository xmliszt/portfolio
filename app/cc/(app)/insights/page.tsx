import countBy from "lodash/countBy.js";
import groupBy from "lodash/groupBy.js";
import maxBy from "lodash/maxBy.js";
import sumBy from "lodash/sumBy.js";
import uniq from "lodash/uniq.js";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { getPostLabel } from "@/app/cc/(app)/log/get-post-label";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignNotes } from "@/lib/cc/data/list-campaign-notes";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listPostMetrics } from "@/lib/cc/data/list-post-metrics";
import { toStatRows } from "@/lib/cc/data/to-stat-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getCumulativeViews } from "@/lib/cc/get-cumulative-views";
import { getHashtagLift } from "@/lib/cc/get-hashtag-lift";
import { getHourHeat } from "@/lib/cc/get-hour-heat";
import { getLatestMetric } from "@/lib/cc/get-latest-metric";
import { getPlatformMedian } from "@/lib/cc/get-platform-median";
import { getTargetStats } from "@/lib/cc/get-target-stats";
import { getViewsAt24h } from "@/lib/cc/get-views-at-24h";
import { PLATFORM_IDS } from "@/lib/cc/platforms";

import { AbPairsPanel } from "./ab-pairs-panel";
import { CumulativeViewsChart } from "./cumulative-views-chart";
import { HashtagLiftPanel } from "./hashtag-lift-panel";
import { HourHeatPanel } from "./hour-heat-panel";
import { KeywordsSection } from "./keywords-section";
import { LearningsPanel } from "./learnings-panel";
import { PlatformTable } from "./platform-table";
import { TargetTable } from "./target-table";

const MIN_OWN_POSTS = 10;
const ENGAGEMENT_FIELDS = ["likes", "comments", "shares", "saves"] as const;

export default async function InsightsPage() {
  await requireCcOwner();
  const campaign = await getCurrentCampaign();
  if (campaign === undefined) {
    return (
      <>
        <PageHeader eyebrow="NO CAMPAIGN" title="Insights · nothing yet" />
        <KeywordsSection />
      </>
    );
  }
  const [postRows, notes] = await Promise.all([
    listCampaignPosts({ campaignId: campaign.id }),
    listCampaignNotes({ campaignId: campaign.id }),
  ]);
  const metricRows = await listPostMetrics({
    postIds: postRows.map((post) => post.id),
  });
  const { posts, metrics } = toStatRows({
    posts: postRows,
    metrics: metricRows,
  });
  const labels = Object.fromEntries(
    postRows.map((post) => [post.id, getPostLabel(post)])
  );
  const postedCount = posts.filter(
    (post) => post.postedAt !== undefined
  ).length;

  const cumulative = getCumulativeViews({ posts, metrics });
  const usedPlatforms = PLATFORM_IDS.filter((platformId) =>
    posts.some((post) => post.platform === platformId)
  );

  const tableRows = usedPlatforms.map((platformId) => {
    const platformPosts = posts.filter((post) => post.platform === platformId);
    const latest = platformPosts.flatMap((post) => {
      const metric = getLatestMetric({ metrics, postId: post.id });
      return metric === undefined ? [] : [{ post, metric }];
    });
    const withViews = latest.flatMap((entry) =>
      entry.metric.views === undefined
        ? []
        : [{ ...entry, views: entry.metric.views }]
    );
    const best = maxBy(withViews, (entry) => entry.views);
    const totalViews = sumBy(withViews, (entry) => entry.views);
    const totalEngagement = sumBy(withViews, (entry) =>
      sumBy(ENGAGEMENT_FIELDS, (field) => entry.metric[field] ?? 0)
    );
    return {
      platformId,
      postedCount: platformPosts.filter((post) => post.postedAt !== undefined)
        .length,
      plannedCount: platformPosts.length,
      median: getPlatformMedian({ posts, metrics, platformId }),
      best:
        best === undefined
          ? undefined
          : { label: labels[best.post.id] ?? "", views: best.views },
      engagement: totalViews === 0 ? undefined : totalEngagement / totalViews,
    };
  });

  const plannedTags = usedPlatforms
    .flatMap((platformId) =>
      Object.entries(
        countBy(
          posts
            .filter((post) => post.platform === platformId)
            .flatMap((post) =>
              uniq(
                post.hashtags.map((tag) => tag.replace(/^#/, "").toLowerCase())
              )
            )
        )
      ).map(([tag, uses]) => ({ platform: platformId, tag, uses }))
    )
    .filter((row) => row.uses >= 2)
    .toSorted((a, b) => b.uses - a.uses)
    .slice(0, 8);

  const heats = usedPlatforms.map((platformId) => ({
    platformId,
    heat: getHourHeat({ posts, metrics, platformId }),
    measured: posts.filter(
      (post) =>
        post.platform === platformId &&
        post.postedAt !== undefined &&
        getViewsAt24h({ metrics, postId: post.id }) !== undefined
    ).length,
  }));
  const ownGrids = heats.flatMap((entry) =>
    entry.heat.kind === "own"
      ? [{ platformId: entry.platformId, cells: entry.heat.cells }]
      : []
  );
  const heatProgress = heats
    .filter((entry) => entry.heat.kind === "researched")
    .map((entry) => ({
      platformId: entry.platformId,
      measured: entry.measured,
    }));

  const pairs = Object.entries(
    groupBy(
      posts.filter((post) => post.variantGroup !== undefined),
      (post) => post.variantGroup
    )
  ).flatMap(([group, groupPosts]) => {
    const mine = groupPosts.find((post) => post.variant === "mine");
    const chatgpt = groupPosts.find((post) => post.variant === "chatgpt");
    if (mine === undefined || chatgpt === undefined) return [];
    return [
      {
        group,
        platformId: mine.platform,
        label: labels[mine.id] ?? "",
        mineViews: getViewsAt24h({ metrics, postId: mine.id }),
        chatgptViews: getViewsAt24h({ metrics, postId: chatgpt.id }),
      },
    ];
  });

  return (
    <>
      <PageHeader
        eyebrow={campaign.name.toUpperCase()}
        title={`Insights · ${postedCount} of ${posts.length} posted`}
      />
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <Panel
          title="Cumulative views"
          aside="by platform · SGT days"
          className="flex-[3_1_620px]"
          bodyClassName="px-[18px] py-4"
        >
          {cumulative.dayEnds.length === 0 ? (
            <p className="text-cc-text-2 leading-relaxed">
              No views logged yet. The chart starts with the first entry on the
              Log numbers page or a Telegram reply; each line is a
              platform&apos;s total views, using every post&apos;s latest
              number.
            </p>
          ) : (
            <CumulativeViewsChart
              dayLabels={cumulative.dayEnds.map((dayEnd) =>
                formatSgt({
                  date: new Date(dayEnd.getTime() - 1),
                  pattern: "EEE dd MMM",
                }).slice(0, 6)
              )}
              series={cumulative.series}
            />
          )}
        </Panel>
        <PlatformTable rows={tableRows} />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <HashtagLiftPanel
          lifts={getHashtagLift({ posts, metrics })}
          plannedTags={plannedTags}
        />
        <HourHeatPanel
          ownGrids={ownGrids}
          progress={heatProgress}
          minPosts={MIN_OWN_POSTS}
        />
      </div>
      <TargetTable
        rows={getTargetStats({
          posts: posts.map((post) => ({
            ...post,
            target:
              postRows.find((row) => row.id === post.id)?.target ?? undefined,
          })),
          metrics,
        })}
      />
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <AbPairsPanel pairs={pairs} />
        <LearningsPanel
          campaignId={campaign.id}
          notes={notes.map((note) => ({
            id: note.id,
            body: note.body,
            dateLabel: formatSgt({
              date: new Date(note.created_at),
              pattern: "EEE dd MMM HH:mm",
            }),
          }))}
        />
      </div>
      <KeywordsSection />
    </>
  );
}
