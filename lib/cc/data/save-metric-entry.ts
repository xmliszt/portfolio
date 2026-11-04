import "server-only";

import { getPlatformMedian } from "@/lib/cc/get-platform-median";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import type { MetricField } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { toStatRows } from "./to-stat-rows";

type Checkpoint = "1h" | "24h" | "7d" | "extra";

/** Insert one metric row for a post, close its log reminder for `checkpoint`, and return how its views compare with the campaign's median on that platform. */
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
  if (
    !isPlatformId(post.platform) ||
    views === undefined ||
    post.campaign_id === null
  ) {
    return { metric, ratio: undefined, platformId: undefined };
  }

  const { data: campaignPosts, error: campaignError } = await supabase
    .from("posts")
    .select("*, post_metrics(*)")
    .eq("campaign_id", post.campaign_id)
    .eq("platform", post.platform);
  if (campaignError) throw campaignError;
  const rows = toStatRows({
    posts: campaignPosts,
    metrics: campaignPosts.flatMap((campaignPost) => campaignPost.post_metrics),
  });
  const median = getPlatformMedian({
    posts: rows.posts,
    metrics: rows.metrics,
    platformId: post.platform,
  });
  const ratio =
    median === undefined || median === 0 ? undefined : views / median;
  return { metric, ratio, platformId: post.platform };
}
