import "server-only";

import { getPlatformMedian } from "@/lib/cc/get-platform-median";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import type { MetricField } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { buildReminderMessage } from "@/lib/cc/telegram/build-reminder-message";
import { sendTelegramMessage } from "@/lib/cc/telegram/send-telegram-message";

import { toStatRows } from "./to-stat-rows";

const REPOST_RATIO = 1.5;

type Checkpoint = "1h" | "24h" | "7d" | "extra";

/** Insert one metric row for a post, close its log reminder for `checkpoint`, and return how its views compare with the platform median; at +24 h a post at 1.5× the median or more also gets a repost reminder sent to Telegram. */
export async function saveMetricEntry(options: {
  postId: string;
  checkpoint: Checkpoint;
  values: { [field in MetricField]?: number | undefined };
}) {
  const supabase = createCcServiceClient();
  const now = new Date().toISOString();
  const { data: metric, error } = await supabase
    .from("post_metrics")
    .insert({
      post_id: options.postId,
      checkpoint: options.checkpoint,
      captured_at: now,
      ...options.values,
    })
    .select("*")
    .single();
  if (error) throw error;

  const { error: reminderError } = await supabase
    .from("reminders")
    .update({ done_at: now })
    .eq("post_id", options.postId)
    .eq("kind", "log")
    .eq("checkpoint", options.checkpoint)
    .is("done_at", null);
  if (reminderError) throw reminderError;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.postId)
    .single();
  if (postError) throw postError;
  const views = options.values.views;
  if (!isPlatformId(post.platform) || views === undefined) {
    return { metric, ratio: undefined, platformId: undefined };
  }

  const { data: platformPosts, error: platformError } = await supabase
    .from("posts")
    .select("*, post_metrics(*)")
    .eq("platform", post.platform)
    .neq("id", post.id)
    .eq("status", "posted");
  if (platformError) throw platformError;
  const rows = toStatRows({
    posts: platformPosts,
    metrics: platformPosts.flatMap((platformPost) => platformPost.post_metrics),
  });
  const median = getPlatformMedian({
    posts: rows.posts,
    metrics: rows.metrics,
    platformId: post.platform,
  });
  const ratio = median === undefined || median === 0 ? undefined : views / median;
  if (options.checkpoint === "24h" && ratio !== undefined && ratio >= REPOST_RATIO) {
    const isTelegramSetUp =
      process.env.CC_TELEGRAM_BOT_TOKEN !== undefined &&
      process.env.CC_TELEGRAM_CHAT_ID !== undefined;
    const messageId = isTelegramSetUp
      ? await sendTelegramMessage(
          buildReminderMessage({
            kind: "repost",
            post: {
              id: post.id,
              platformId: post.platform,
              title: post.title,
              body: post.body,
              target: post.target,
              url: post.url,
            },
            ratio,
          })
        )
      : null;
    const { error: repostError } = await supabase.from("reminders").upsert(
      {
        post_id: post.id,
        kind: "repost",
        checkpoint: "24h",
        fire_at: now,
        sent_at: messageId === null ? null : now,
        telegram_message_id: messageId,
      },
      { onConflict: "post_id,kind,checkpoint" }
    );
    if (repostError) throw repostError;
  }
  return { metric, ratio, platformId: post.platform };
}
