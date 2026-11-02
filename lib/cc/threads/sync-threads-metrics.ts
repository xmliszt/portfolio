import "server-only";

import keyBy from "lodash/keyBy.js";

import { saveMetricEntry } from "@/lib/cc/data/save-metric-entry";
import { matchThreadsPosts } from "@/lib/cc/match-threads-posts";
import { pickSyncCheckpoint } from "@/lib/cc/pick-sync-checkpoint";
import type { MetricCheckpoint } from "@/lib/cc/stats-types";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { toThreadsMetricValues } from "@/lib/cc/to-threads-metric-values";

import { fetchThreadsInsights } from "./fetch-threads-insights";
import { listMyThreads } from "./list-my-threads";
import { refreshThreadsToken } from "./refresh-threads-token";

const DAY_MS = 86_400_000;
const CHECKPOINTS: readonly MetricCheckpoint[] = ["1h", "24h", "7d", "extra"];

/** Refresh the stored Threads token when under 10 days are left, then save one `post_metrics` row from Threads insights for each posted Threads post with a stored media id or a link to one of the account's recent threads and is due a checkpoint; return the saved checkpoints, and why nothing ran when it could not. A token Threads rejects gets `expires_at` set to `now`. */
export async function syncThreadsMetrics(options: { now: Date }) {
  const supabase = createCcServiceClient();
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("provider", "threads")
    .maybeSingle();
  if (error) throw error;
  if (integration === null) return { saved: [], skipped: "not connected" };

  async function markTokenExpired() {
    const { error: expireError } = await supabase
      .from("integrations")
      .update({ expires_at: options.now.toISOString() })
      .eq("provider", "threads");
    if (expireError) throw expireError;
  }

  async function getAccessToken(row: NonNullable<typeof integration>) {
    const expiresAt =
      row.expires_at === null ? undefined : new Date(row.expires_at);
    const isExpiring =
      expiresAt !== undefined &&
      expiresAt.getTime() - options.now.getTime() < 10 * DAY_MS;
    const isOldEnough =
      options.now.getTime() - new Date(row.updated_at).getTime() >= DAY_MS;
    if (!isExpiring || !isOldEnough) return row.access_token;
    const refreshed = await refreshThreadsToken({
      accessToken: row.access_token,
      now: options.now,
    });
    if (refreshed.kind === "error") {
      console.warn(`[cc/threads] token refresh failed: ${refreshed.message}`);
      return row.access_token;
    }
    const { error: updateError } = await supabase
      .from("integrations")
      .update({
        access_token: refreshed.data.accessToken,
        expires_at: refreshed.data.expiresAt.toISOString(),
        updated_at: options.now.toISOString(),
      })
      .eq("provider", "threads");
    if (updateError) throw updateError;
    return refreshed.data.accessToken;
  }
  const accessToken = await getAccessToken(integration);

  const threads = await listMyThreads({ accessToken, limit: 50 });
  if (threads.kind === "error") {
    console.warn(`[cc/threads] listing threads failed: ${threads.message}`);
    if (threads.reason === "token") await markTokenExpired();
    return { saved: [], skipped: `threads list failed (${threads.reason})` };
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, url, platform_post_id, posted_at, post_metrics(checkpoint, captured_at)"
    )
    .eq("platform", "threads")
    .eq("status", "posted")
    .or("url.not.is.null,platform_post_id.not.is.null");
  if (postsError) throw postsError;
  const postsById = keyBy(posts, (post) => post.id);

  const matches = matchThreadsPosts({
    threads: threads.data.data.map((thread) => ({
      id: thread.id,
      permalink: thread.permalink,
    })),
    posts,
  });
  const results = await Promise.all(
    matches.map(async (match) => {
      const postedAt = postsById[match.postId]?.posted_at;
      if (postedAt === null || postedAt === undefined) return [];
      const checkpoint = pickSyncCheckpoint({
        postedAt: new Date(postedAt),
        now: options.now,
        existing: (postsById[match.postId]?.post_metrics ?? []).flatMap(
          (metric) => {
            const known = CHECKPOINTS.find(
              (value) => value === metric.checkpoint
            );
            return known === undefined
              ? []
              : [
                  {
                    checkpoint: known,
                    capturedAt: new Date(metric.captured_at),
                  },
                ];
          }
        ),
      });
      if (checkpoint === undefined) return [];
      const insights = await fetchThreadsInsights({
        accessToken,
        mediaId: match.mediaId,
      });
      if (insights.kind === "error") {
        console.warn(
          `[cc/threads] insights for ${match.mediaId} failed: ${insights.message}`
        );
        return [];
      }
      const values = toThreadsMetricValues(insights.data.data);
      if (Object.values(values).every((value) => value === undefined)) {
        return [];
      }
      try {
        await saveMetricEntry({ postId: match.postId, checkpoint, values });
      } catch (saveError) {
        console.warn(
          `[cc/threads] saving ${checkpoint} for post ${match.postId} failed: ${saveError instanceof Error ? saveError.message : String(saveError)}`
        );
        return [];
      }
      return [{ postId: match.postId, checkpoint }];
    })
  );
  return { saved: results.flat(), skipped: undefined };
}
