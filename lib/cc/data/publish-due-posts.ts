import "server-only";

import { AUTO_PUBLISH_PLATFORM_IDS } from "@/lib/cc/auto-publish-platforms";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { notifyPublishOutcome } from "./notify-publish-outcome";
import { publishClaimedPost } from "./publish-claimed-post";

const MINUTE_MS = 60_000;
const BATCH_SIZE = 3;
const MISSED_AFTER_MS = 30 * MINUTE_MS;
const STUCK_AFTER_MS = 10 * MINUTE_MS;

/** Fail auto-posts claimed over 10 minutes ago that never finished and auto-posts over 30 minutes late, then claim up to `BATCH_SIZE` due auto-posts by stamping `publish_claimed_at` and publish them one at a time; return how many went live and how many failed. */
export async function publishDuePosts(options: { now: Date }) {
  const supabase = createCcServiceClient();
  const nowIso = options.now.toISOString();
  const { data: stuck, error: stuckError } = await supabase
    .from("posts")
    .update({
      publish_error:
        "The auto-post stopped part way, so it may or may not be live. Check the platform before you post again.",
    })
    .eq("auto_publish", true)
    .eq("status", "scheduled")
    .is("publish_error", null)
    .lt(
      "publish_claimed_at",
      new Date(options.now.getTime() - STUCK_AFTER_MS).toISOString()
    )
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
    .limit(BATCH_SIZE);
  if (dueError) throw dueError;

  const outcomes: string[] = [];
  for (const candidate of due) {
    const { data: claimed, error: claimError } = await supabase
      .from("posts")
      .update({ publish_claimed_at: new Date().toISOString() })
      .eq("id", candidate.id)
      .eq("auto_publish", true)
      .eq("status", "scheduled")
      .is("publish_claimed_at", null)
      .is("publish_error", null)
      .select("*")
      .maybeSingle();
    if (claimError) throw claimError;
    if (claimed === null) continue;
    const result = await publishClaimedPost({ post: claimed, now: new Date() });
    outcomes.push(result.kind);
  }
  const published = outcomes.filter((kind) => kind === "ok").length;
  return {
    published,
    failed: outcomes.length - published + stuck.length + missed.length,
  };
}
