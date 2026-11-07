import countBy from "lodash/countBy.js";
import keyBy from "lodash/keyBy.js";
import maxBy from "lodash/maxBy.js";
import sortBy from "lodash/sortBy.js";
import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getFocusedCampaign } from "@/lib/cc/data/get-focused-campaign";
import { listAllPosts } from "@/lib/cc/data/list-all-posts";
import { listCampaignSummaries } from "@/lib/cc/data/list-campaign-summaries";
import { listCampaigns } from "@/lib/cc/data/list-campaigns";
import { listPostMetrics } from "@/lib/cc/data/list-post-metrics";
import { toStatRows } from "@/lib/cc/data/to-stat-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getHourHeat } from "@/lib/cc/get-hour-heat";
import { getPostName } from "@/lib/cc/get-post-name";
import { getSgtParts } from "@/lib/cc/get-sgt-parts";
import { getSgtWeek } from "@/lib/cc/get-sgt-week";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { parseCalendarShow } from "@/lib/cc/parse-calendar-show";
import { parseCampaignPlan } from "@/lib/cc/parse-campaign-plan";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { RESEARCHED_WINDOWS } from "@/lib/cc/researched-windows";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";
import { toggleCalendarShow } from "@/lib/cc/toggle-calendar-show";

import { buildScheduleContext } from "./build-schedule-context";
import {
  CalendarShowFilter,
  type CalendarShowOption,
} from "./calendar-show-filter";
import { FollowUpsPanel } from "./follow-ups-panel";
import { HeatLegendPanel } from "./heat-legend-panel";
import { HeatPicker } from "./heat-picker";
import { PostEditor } from "./post-editor";
import { type GridPost, WeekGrid } from "./week-grid";

type CalendarPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DEFAULT_FIRST_HOUR = 7;

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function isDateString(value: string | undefined): value is string {
  return (
    value !== undefined &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    formatSgt({
      date: sgtToUtc({ date: value, time: "12:00" }),
      pattern: "yyyy-MM-dd",
    }) === value
  );
}

export default async function CalendarPage(props: CalendarPageProps) {
  await requireCcOwner();
  const searchParams = await props.searchParams;
  const now = new Date();
  const [focused, campaigns, summaries, allPosts] = await Promise.all([
    getFocusedCampaign(),
    listCampaigns(),
    listCampaignSummaries(),
    listAllPosts({ variant: "mine" }),
  ]);
  if (allPosts.length === 0) {
    return <PageHeader eyebrow="CALENDAR" title="No posts yet" />;
  }

  const posts = sortBy(
    allPosts,
    (post) => post.scheduled_at === null,
    (post) => post.scheduled_at
  );
  const campaignPosts = posts.filter((post) => post.campaign_id !== null);
  const metrics = await listPostMetrics({
    postIds: campaignPosts.map((post) => post.id),
  });
  const stats = toStatRows({ posts: campaignPosts, metrics });

  const nextPost = posts.find(
    (post) =>
      post.status === "scheduled" &&
      post.scheduled_at !== null &&
      new Date(post.scheduled_at) > now
  );
  const weekParam = readParam(searchParams.week);
  const anchorDate = isDateString(weekParam)
    ? weekParam
    : formatSgt({
        date:
          nextPost?.scheduled_at === undefined || nextPost.scheduled_at === null
            ? now
            : new Date(nextPost.scheduled_at),
        pattern: "yyyy-MM-dd",
      });
  const week = getSgtWeek({ date: anchorDate });
  const weekStart = week.days[0];
  const today = formatSgt({ date: now, pattern: "yyyy-MM-dd" });

  const weekPosts = posts.flatMap((post) => {
    if (post.scheduled_at === null || !isPlatformId(post.platform)) return [];
    const at = new Date(post.scheduled_at);
    const day = formatSgt({ date: at, pattern: "yyyy-MM-dd" });
    return week.days.includes(day)
      ? [{ post, platformId: post.platform, at, day }]
      : [];
  });

  const weekTopLevel = weekPosts.filter(
    (entry) =>
      !(
        (entry.post.kind === "reply" || entry.post.kind === "comment") &&
        entry.post.parent_post_id !== null
      )
  );
  const weekCampaignIds = new Set(
    weekTopLevel.flatMap((entry) =>
      entry.post.campaign_id === null ? [] : [entry.post.campaign_id]
    )
  );
  const campaignsById = keyBy(campaigns, (row) => row.id);
  const showParam = readParam(searchParams.show);
  const requestedShowIds = new Set(showParam?.split(",") ?? []);
  const showOptions = [
    ...summaries.flatMap((summary): CalendarShowOption[] =>
      summary.isActive ||
      weekCampaignIds.has(summary.id) ||
      requestedShowIds.has(summary.id)
        ? [
            {
              kind: "campaign",
              id: summary.id,
              name: summary.name,
              code: summary.code,
              color: summary.color,
              postCount: weekTopLevel.filter(
                (entry) => entry.post.campaign_id === summary.id
              ).length,
            },
          ]
        : []
    ),
    {
      kind: "other",
      id: "other",
      postCount: weekTopLevel.filter((entry) => entry.post.campaign_id === null)
        .length,
    } satisfies CalendarShowOption,
  ];
  const showIds = parseCalendarShow({
    value: showParam,
    optionIds: showOptions.map((option) => option.id),
  });
  const isAllShown = showIds.length === showOptions.length;
  const onlyShownId = showIds.length === 1 ? showIds.at(0) : undefined;
  function isShown(post: { campaign_id: string | null }) {
    return showIds.includes(post.campaign_id ?? "other");
  }

  const heatParam = readParam(searchParams.heat);
  const postCounts = countBy(
    weekPosts.filter((entry) => entry.post.kind === "post"),
    (entry) => entry.platformId
  );
  const busiestPlatformId = maxBy(
    PLATFORM_IDS.filter(
      (id) => postCounts[id] > 0 && RESEARCHED_WINDOWS[id].hours.length > 0
    ),
    (id) => postCounts[id]
  );
  const heatPlatformId =
    heatParam !== undefined && isPlatformId(heatParam)
      ? heatParam
      : (busiestPlatformId ?? "xiaohongshu");
  const weekMidday = sgtToUtc({ date: weekStart, time: "12:00" });
  const heat = getHourHeat({
    ...stats,
    platformId: heatPlatformId,
    weekOf: weekMidday,
  });

  const editId = readParam(searchParams.edit);
  function buildHref(options: {
    week?: string;
    heat?: PlatformId;
    edit?: string;
    show?: readonly string[];
  }) {
    const show = options.show ?? showIds;
    const params = new URLSearchParams({
      week: options.week ?? weekStart,
      heat: options.heat ?? heatPlatformId,
      ...(show.length === showOptions.length ? {} : { show: show.join(",") }),
      ...(options.edit === undefined ? {} : { edit: options.edit }),
    });
    return `/calendar?${params.toString()}`;
  }

  const childrenByParent = countBy(
    posts.filter(
      (post) =>
        post.parent_post_id !== null &&
        (post.kind === "reply" || post.kind === "comment")
    ),
    (post) => post.parent_post_id
  );
  const gridPosts = weekTopLevel.flatMap((entry): GridPost[] => {
    const post = entry.post;
    if (!isShown(post)) return [];
    const campaign =
      post.campaign_id === null ? undefined : campaignsById[post.campaign_id];
    const childCount = childrenByParent[post.id] ?? 0;
    const isComment =
      posts.find((child) => child.parent_post_id === post.id)?.kind ===
      "comment";
    const childWord = isComment
      ? childCount === 1
        ? "comment"
        : "comments"
      : childCount === 1
        ? "reply"
        : "replies";
    return [
      {
        id: post.id,
        platformId: entry.platformId,
        day: entry.day,
        hour: getSgtParts(entry.at).hour,
        timeLabel: formatSgt({ date: entry.at, pattern: "HH:mm" }),
        label:
          post.target ??
          (getPostName(post) || PLATFORMS[entry.platformId].label),
        status: post.status,
        group:
          campaign === undefined
            ? { kind: "other", project: post.project ?? "" }
            : { kind: "campaign", code: campaign.code, color: campaign.color },
        isChipShown: onlyShownId === undefined,
        childNote:
          childCount === 0 ? undefined : `+ ${childCount} ${childWord}`,
        href: buildHref({ edit: post.id }),
        isSelected: post.id === editId,
      },
    ];
  });

  const heatHours = new Set(
    heat.cells.flatMap((row) =>
      row.flatMap((value, hour) => (value ? [hour] : []))
    )
  );
  const hours = Array.from({ length: 24 }, (_, hour) => hour).filter(
    (hour) =>
      hour >= DEFAULT_FIRST_HOUR ||
      heatHours.has(hour) ||
      gridPosts.some((post) => post.hour === hour)
  );

  const editPost = posts.find((post) => post.id === editId);
  const editCampaign =
    editPost?.campaign_id === null || editPost === undefined
      ? focused
      : campaignsById[editPost.campaign_id];
  const schedule = buildScheduleContext({
    posts,
    plan: parseCampaignPlan(editCampaign?.plan ?? null),
  });
  const hiddenCount = weekTopLevel.filter(
    (entry) => !isShown(entry.post)
  ).length;
  const isHeatEmpty = heat.cells.flat().every((value) => !value);
  const weekLabel = formatSgt({
    date: weekMidday,
    pattern: "EEE dd MMM",
  }).slice(4);

  return (
    <>
      <PageHeader
        eyebrow={`CALENDAR // ${
          isAllShown
            ? "ALL CAMPAIGNS + OTHER"
            : showOptions
                .filter((option) => showIds.includes(option.id))
                .map((option) =>
                  option.kind === "campaign" ? option.code : "OTHER"
                )
                .join(" + ")
        } · ALL TIMES SGT`}
        title={`Week of ${weekLabel}`}
        aside={
          <nav
            aria-label="Week"
            className="flex flex-wrap items-center gap-x-2 gap-y-2"
          >
            <Link
              href={buildHref({ week: week.previous })}
              className="hover:border-primary hover:text-primary flex min-h-7 items-center border px-3 text-[12px] tracking-[0.04em]"
            >
              ← PREV
            </Link>
            <Link
              href={buildHref({
                week: getSgtWeek({ date: today }).days[0],
              })}
              className="hover:border-primary hover:text-primary flex min-h-7 items-center border px-3 text-[12px] tracking-[0.04em]"
            >
              THIS WEEK
            </Link>
            <Link
              href={buildHref({ week: week.next })}
              className="hover:border-primary hover:text-primary flex min-h-7 items-center border px-3 text-[12px] tracking-[0.04em]"
            >
              NEXT →
            </Link>
            <Link
              href={`/new?${new URLSearchParams({ date: week.days.includes(today) ? today : weekStart, platform: heatPlatformId }).toString()}#schedule`}
              className="border-primary bg-primary text-primary-foreground hover:bg-primary/85 flex min-h-7 items-center border px-3 text-[12px] font-bold tracking-[0.04em]"
            >
              + SCHEDULE POST
            </Link>
          </nav>
        }
      />
      <CalendarShowFilter
        options={showOptions}
        selectedIds={showIds}
        hrefs={{
          all: buildHref({ show: showOptions.map((option) => option.id) }),
          toggle: Object.fromEntries(
            showOptions.map((option) => [
              option.id,
              buildHref({
                show: toggleCalendarShow({
                  optionIds: showOptions.map((entry) => entry.id),
                  selectedIds: showIds,
                  optionId: option.id,
                }),
              }),
            ])
          ),
        }}
        hiddenCount={hiddenCount}
      />
      <HeatPicker
        selected={heatPlatformId}
        hrefs={PLATFORM_IDS.map((platformId) => ({
          platformId,
          href: buildHref({ heat: platformId }),
        }))}
      />
      {editPost !== undefined &&
        editPost.scheduled_at !== null &&
        isPlatformId(editPost.platform) && (
          <PostEditor
            key={`${editPost.id}-${editPost.scheduled_at}-${editPost.status}`}
            campaignId={editCampaign?.id}
            post={{
              id: editPost.id,
              platformId: editPost.platform,
              name: getPostName(editPost) || PLATFORMS[editPost.platform].label,
              status: editPost.status,
              date: formatSgt({
                date: new Date(editPost.scheduled_at),
                pattern: "yyyy-MM-dd",
              }),
              time: formatSgt({
                date: new Date(editPost.scheduled_at),
                pattern: "HH:mm",
              }),
              childCount: childrenByParent[editPost.id] ?? 0,
            }}
            closeHref={buildHref({})}
            schedule={schedule}
          />
        )}
      <WeekGrid
        days={week.days.map((date) => ({
          date,
          label: formatSgt({
            date: sgtToUtc({ date, time: "12:00" }),
            pattern: "EEE dd MMM",
          })
            .slice(0, 6)
            .toUpperCase(),
          isToday: date === today,
        }))}
        hours={hours}
        posts={gridPosts}
        heat={heat}
        heatPlatformId={heatPlatformId}
      />
      <p className="text-muted-foreground text-[11px]">
        Pick a post to reschedule, skip or delete it. X, Threads and Bluesky
        posts can auto-post from the Composer.
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-3">
        <HeatLegendPanel
          platformId={heatPlatformId}
          source={heat.kind}
          isEmpty={isHeatEmpty}
          weekOf={weekMidday}
        />
        <FollowUpsPanel />
      </div>
    </>
  );
}
