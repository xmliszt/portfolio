import Link from "next/link";

import { CollapsibleSection } from "@/app/cc/_ui/collapsible-section";
import { PageHeader } from "@/app/cc/_ui/page-header";
import { Panel } from "@/app/cc/_ui/panel";
import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getCurrentCampaign } from "@/lib/cc/data/get-current-campaign";
import { listCampaignPosts } from "@/lib/cc/data/list-campaign-posts";
import { listDueReminders } from "@/lib/cc/data/list-due-reminders";
import { listPostMetrics } from "@/lib/cc/data/list-post-metrics";
import { toStatRows } from "@/lib/cc/data/to-stat-rows";
import { formatDuration } from "@/lib/cc/format-duration";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getLatestMetric } from "@/lib/cc/get-latest-metric";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import { METRIC_FIELDS, PLATFORMS } from "@/lib/cc/platforms";

import { formatCheckpoint } from "./format-checkpoint";
import { getNextLogReminder } from "./get-next-log-reminder";
import { getPostLabel } from "./get-post-label";
import { LogEntryList } from "./log-entry-list";
import type { LogEntryPost, LogEntryRowData } from "./log-entry-types";
import { TelegramReplyMock } from "./telegram-reply-mock";

const CHECKPOINTS = ["1h", "24h", "7d"] as const;

export default async function LogPage() {
  await requireCcOwner();
  const now = new Date();
  const campaign = await getCurrentCampaign();
  const posts =
    campaign === undefined
      ? []
      : await listCampaignPosts({ campaignId: campaign.id });
  const postIds = posts.map((post) => post.id);
  const [metricRows, dueReminders, nextReminder] = await Promise.all([
    listPostMetrics({ postIds }),
    listDueReminders({ now }),
    getNextLogReminder({ now, postIds }),
  ]);
  const { metrics } = toStatRows({ posts, metrics: metricRows });

  const entryPosts = posts.flatMap(
    (
      post
    ): (LogEntryPost & {
      status: string;
    })[] => {
      if (!isPlatformId(post.platform)) return [];
      const latest = getLatestMetric({ metrics, postId: post.id });
      return [
        {
          postId: post.id,
          platformId: post.platform,
          label: getPostLabel(post),
          target: post.target ?? undefined,
          lastValues: Object.fromEntries(
            METRIC_FIELDS.map((field) => [field, latest?.[field]])
          ),
          status: post.status,
        },
      ];
    }
  );

  const dueRows = dueReminders.flatMap((reminder): LogEntryRowData[] => {
    const post = entryPosts.find((entry) => entry.postId === reminder.post_id);
    const checkpoint = CHECKPOINTS.find(
      (value) => value === reminder.checkpoint
    );
    if (
      reminder.kind !== "log" ||
      post === undefined ||
      checkpoint === undefined
    ) {
      return [];
    }
    const fireAt = new Date(reminder.fire_at);
    return [
      {
        ...post,
        key: `due-${reminder.id}`,
        checkpoint,
        dueNote: `due ${formatSgt({ date: fireAt, pattern: "EEE dd MMM HH:mm" })} · ${formatDuration(now.getTime() - fireAt.getTime())} late`,
      },
    ];
  });

  const nextPost =
    nextReminder === undefined
      ? undefined
      : entryPosts.find((entry) => entry.postId === nextReminder.post_id);
  const emptyNote =
    nextReminder === undefined || nextPost === undefined ? (
      <>
        Nothing to log, and no checks scheduled. Every scheduled post gets
        checks at +1 h, +24 h and +7 d; set one up in the{" "}
        <Link href="/calendar" className="text-primary underline">
          calendar
        </Link>
        .
      </>
    ) : (
      <>
        Nothing due right now. Next check:{" "}
        <span className="text-foreground">
          {formatCheckpoint(nextReminder.checkpoint ?? "")} ·{" "}
          {PLATFORMS[nextPost.platformId].label} · “{nextPost.label}”
        </span>{" "}
        at{" "}
        <span className="text-primary">
          {formatSgt({
            date: new Date(nextReminder.fire_at),
            pattern: "EEE dd MMM HH:mm",
          })}{" "}
          SGT
        </span>
        , in{" "}
        {formatDuration(
          new Date(nextReminder.fire_at).getTime() - now.getTime()
        )}
        .
      </>
    );

  const isTelegramLinked =
    process.env.CC_TELEGRAM_BOT_TOKEN !== undefined &&
    process.env.CC_TELEGRAM_CHAT_ID !== undefined;

  return (
    <>
      <PageHeader
        eyebrow={campaign?.name.toUpperCase() ?? "NO CAMPAIGN"}
        title={`Log numbers · ${dueRows.length === 0 ? "nothing due" : `${dueRows.length} due`}`}
      />
      <Panel
        title="Quick entry"
        aside="Tab to move · Enter saves the row · takes 1.2k, 1,240, 1.2万 · skipped fields stay empty"
      >
        <LogEntryList
          dueRows={dueRows}
          postedPosts={entryPosts.filter((post) => post.status === "posted")}
          emptyNote={emptyNote}
        />
      </Panel>
      <CollapsibleSection
        title="Reply on Telegram instead"
        summary="the bot asks at +1 h, +24 h and +7 d; reply with one line"
      >
        <TelegramReplyMock
          platformId={dueRows.at(0)?.platformId ?? "xiaohongshu"}
          telegramLinked={isTelegramLinked}
        />
      </CollapsibleSection>
    </>
  );
}
