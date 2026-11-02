import "server-only";

import { AUTO_PUBLISH_PLATFORM_IDS } from "@/lib/cc/auto-publish-platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { markPostLive } from "./mark-post-live";
import { notifyPublishOutcome } from "./notify-publish-outcome";
import { publishClaimedPost } from "./publish-claimed-post";

const MINUTE_MS = 60_000;
const MISSED_AFTER_MS = 30 * MINUTE_MS;
const STUCK_AFTER_MS = 10 * MINUTE_MS;

/** Finish posts claimed over 10 minutes ago that the platform already took (`platform_post_id` set) by marking them live, fail the other claimed posts that never finished and auto-posts over 30 minutes late, then claim the earliest due auto-post by stamping `publish_claimed_at` and publish it; return how many went live and how many failed. */
export async function publishDuePosts(options: { now: Date }) {
  const supabase = createCcServiceClient();
  const nowIso = options.now.toISOString();
  const stuckBefore = new Date(
    options.now.getTime() - STUCK_AFTER_MS
  ).toISOString();
  const { data: livePosts, error: liveError } = await supabase
    .from("posts")
    .select("*")
    .in("status", ["draft", "scheduled"])
    .is("publish_error", null)
    .not("platform_post_id", "is", null)
    .lt("publish_claimed_at", stuckBefore);
  if (liveError) throw liveError;
  await Promise.all(
    livePosts.map(async (post) => {
      await markPostLive({
        postId: post.id,
        url: post.url ?? undefined,
        platformPostId: post.platform_post_id ?? undefined,
      });
      await notifyPublishOutcome({
        post,
        now: options.now,
        outcome: { kind: "posted", url: post.url ?? undefined },
      });
    })
  );

  const { data: stuck, error: stuckError } = await supabase
    .from("posts")
    .update({
      publish_error:
        "The auto-post stopped part way, so it may or may not be live. Check the platform before you post again.",
    })
    .in("status", ["draft", "scheduled"])
    .is("publish_error", null)
    .is("platform_post_id", null)
    .lt("publish_claimed_at", stuckBefore)
    .select("*");
  if (stuckError) throw stuckError;

  const { data: missed, error: missedError } = await supabase
    .from("posts")
    .update({
      publish_claimed_at: nowIso,
      publish_error:
        "CC missed this post's time by over 30 minutes, so it did not post it.",
    })
    .eq("auto_publish", true)
    .eq("status", "scheduled")
    .is("publish_error", null)
    .is("publish_claimed_at", null)
    .lt(
      "scheduled_at",
      new Date(options.now.getTime() - MISSED_AFTER_MS).toISOString()
    )
    .select("*");
  if (missedError) throw missedError;

  await Promise.all(
    [...stuck, ...missed].map((post) =>
      notifyPublishOutcome({
        post,
        now: options.now,
        outcome: { kind: "failed", error: post.publish_error ?? "" },
      })
    )
  );

  const { data: due, error: dueError } = await supabase
    .from("posts")
    .select("*")
    .eq("auto_publish", true)
    .eq("status", "scheduled")
    .in("kind", ["post", "repost"])
    .in("platform", [...AUTO_PUBLISH_PLATFORM_IDS])
    .is("publish_error", null)
    .is("publish_claimed_at", null)
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(1);
  if (dueError) throw dueError;

  const failedEarly = stuck.length + missed.length;
  const finished = livePosts.length;
  const candidate = due.at(0);
  if (candidate === undefined)
    return { published: finished, failed: failedEarly };
  const { data: claimed, error: claimError } = await supabase
    .from("posts")
    .update({ publish_claimed_at: nowIso })
    .eq("id", candidate.id)
    .eq("auto_publish", true)
    .eq("status", "scheduled")
    .is("publish_claimed_at", null)
    .is("publish_error", null)
    .select("*")
    .maybeSingle();
  if (claimError) throw claimError;
  if (claimed === null) return { published: finished, failed: failedEarly };
  const result = await publishClaimedPost({ post: claimed, now: options.now });
  return result.kind === "ok"
    ? { published: finished + 1, failed: failedEarly }
    : { published: finished, failed: failedEarly + 1 };
}
