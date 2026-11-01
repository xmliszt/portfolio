import "server-only";

import { getPlatformMedian } from "@/lib/cc/get-platform-median";
import { getRepostSuggestions } from "@/lib/cc/get-repost-suggestions";
import { isPlatformId } from "@/lib/cc/is-platform-id";
import type { MetricField } from "@/lib/cc/platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { toStatRows } from "./to-stat-rows";

type Checkpoint = "1h" | "24h" | "7d" | "extra";

/** Insert one metric row for a post, close its log reminder for `checkpoint`, and return how its views compare with the campaign's median on that platform; at +24 h a post that `getRepostSuggestions` picks also gets one "repost" reminder, due now. */
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
  const isRepostCandidate =
    options.checkpoint === "24h" &&
    getRepostSuggestions(rows).some(
      (suggestion) => suggestion.post.id === post.id
    );
  if (isRepostCandidate) {
    const { data: existing, error: existingError } = await supabase
      .from("reminders")
      .select("id")
      .eq("post_id", post.id)
      .eq("kind", "repost")
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing === null) {
      const { error: repostError } = await supabase.from("reminders").insert({
        post_id: post.id,
        kind: "repost",
        checkpoint: "24h",
        fire_at: now,
      });
      if (repostError) throw repostError;
    }
  }
  return { metric, ratio, platformId: post.platform };
}
