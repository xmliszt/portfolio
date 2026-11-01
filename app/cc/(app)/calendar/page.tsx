import countBy from "lodash/countBy.js";
import maxBy from "lodash/maxBy.js";
import Link from "next/link";

import { PageHeader } from "@/app/cc/_ui/page-header";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listPostMetrics } from "@/lib/cc/data/list-post-metrics";
import { toStatRows } from "@/lib/cc/data/to-stat-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getHourHeat } from "@/lib/cc/get-hour-heat";
import { getPostName } from "@/lib/cc/get-post-name";
import { getSgtParts } from "@/lib/cc/get-sgt-parts";
import { getSgtWeek } from "@/lib/cc/get-sgt-week";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { RESEARCHED_WINDOWS } from "@/lib/cc/researched-windows";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";

import { FollowUpsPanel } from "./follow-ups-panel";
import { HeatLegendPanel } from "./heat-legend-panel";
import { HeatPicker } from "./heat-picker";
import { PostEditor } from "./post-editor";
import { SchedulePostForm } from "./schedule-post-form";
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
  const campaign = await getCurrentCampaign();
  if (campaign === undefined) {
    return <PageHeader eyebrow="CALENDAR" title="No campaign yet" />;
  }

  const now = new Date();
  const posts = await listCampaignPosts({
    campaignId: campaign.id,
    variant: "mine",
  });
  const metrics = await listPostMetrics({
    postIds: posts.map((post) => post.id),
  });
  const stats = toStatRows({ posts, metrics });

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

  const heatParam = readParam(searchParams.heat);
  const postCounts = countBy(
    weekPosts.filter((entry) => entry.post.kind === "post"),
    (entry) => entry.platformId
  );
  const busiestPlatformId = maxBy(
    PLATFORM_IDS.filter(
      (id) => postCounts[id] > 0 && RESEARCHED_WINDOWS[id].length > 0
    ),
    (id) => postCounts[id]
  );
  const heatPlatformId =
    heatParam !== undefined && isPlatformId(heatParam)
      ? heatParam
      : (busiestPlatformId ?? "xiaohongshu");
  const heat = getHourHeat({ ...stats, platformId: heatPlatformId });

  const editId = readParam(searchParams.edit);
  function buildHref(options: {
    week?: string;
    heat?: PlatformId;
    edit?: string;
  }) {
    const params = new URLSearchParams({
      week: options.week ?? weekStart,
      heat: options.heat ?? heatPlatformId,
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
  const gridPosts = weekPosts.flatMap((entry): GridPost[] => {
    const post = entry.post;
    if (post.kind === "reply" || post.kind === "comment") return [];
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
  const isHeatEmpty = heat.cells.flat().every((value) => !value);
  const weekLabel = formatSgt({
    date: sgtToUtc({ date: weekStart, time: "12:00" }),
    pattern: "EEE dd MMM",
  }).slice(4);

  return (
    <>
      <PageHeader
        eyebrow={`CALENDAR // ${campaign.name.toUpperCase()} · ALL TIMES SGT`}
        title={`Week of ${weekLabel}`}
        aside={
          <nav
            aria-label="Week"
            className="flex flex-wrap items-center gap-x-2 gap-y-2"
          >
            <Link
              href={buildHref({ week: week.previous })}
              className="hover:border-primary hover:text-primary flex min-h-11 items-center border px-3 text-[12px] tracking-[0.1em]"
            >
              ← PREV
            </Link>
            <Link
              href={buildHref({
                week: getSgtWeek({ date: today }).days[0],
              })}
              className="hover:border-primary hover:text-primary flex min-h-11 items-center border px-3 text-[12px] tracking-[0.1em]"
            >
              THIS WEEK
            </Link>
            <Link
              href={buildHref({ week: week.next })}
              className="hover:border-primary hover:text-primary flex min-h-11 items-center border px-3 text-[12px] tracking-[0.1em]"
            >
              NEXT →
            </Link>
            <a
              href="#schedule"
              className="border-primary bg-primary text-primary-foreground hover:bg-primary/85 flex min-h-11 items-center border px-4 text-[12px] font-bold tracking-[0.1em]"
            >
              + SCHEDULE POST
            </a>
          </nav>
        }
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
        Pick a post to reschedule or skip it. Posting is manual; the calendar
        only plans and reminds.
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-5">
        <HeatLegendPanel
          platformId={heatPlatformId}
          source={heat.kind}
          isEmpty={isHeatEmpty}
        />
        <SchedulePostForm
          campaignId={campaign.id}
          campaignLink={campaign.link ?? undefined}
          defaultDate={week.days.includes(today) ? today : weekStart}
          defaultPlatformId={heatPlatformId}
        />
      </div>
      <FollowUpsPanel />
    </>
  );
}
