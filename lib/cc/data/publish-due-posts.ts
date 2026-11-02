import "server-only";

import keyBy from "lodash/keyBy.js";
import uniq from "lodash/uniq.js";

import { AUTO_PUBLISH_PLATFORM_IDS } from "@/lib/cc/auto-publish-platforms";
import { getAutoPublishState } from "@/lib/cc/get-auto-publish-state";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { markPostLive } from "./mark-post-live";
import { notifyPublishOutcome } from "./notify-publish-outcome";
import { publishClaimedPost } from "./publish-claimed-post";

const MINUTE_MS = 60_000;
const PENDING_LIMIT = 50;
const STUCK_AFTER_MS = 10 * MINUTE_MS;

/** Finish posts claimed over 10 minutes ago that the platform already took (`platform_post_id` set) by marking them live, fail the other claimed posts that never finished and the auto-posts `getAutoPublishState` calls missed, then claim the earliest due auto-post by stamping `publish_claimed_at` and publish it; return how many went live and how many failed. */
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

  const { data: pending, error: pendingError } = await supabase
    .from("posts")
    .select("*")
    .eq("auto_publish", true)
    .eq("status", "scheduled")
    .in("platform", [...AUTO_PUBLISH_PLATFORM_IDS])
    .is("publish_error", null)
    .is("publish_claimed_at", null)
    .order("scheduled_at", { ascending: true })
    .limit(PENDING_LIMIT);
  if (pendingError) throw pendingError;
  const parentIds = uniq(
    pending.flatMap((post) =>
      post.parent_post_id === null ? [] : [post.parent_post_id]
    )
  );
  const { data: parents, error: parentsError } =
    parentIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("posts")
          .select("id, kind, status, scheduled_at, posted_at")
          .in("id", parentIds);
  if (parentsError) throw parentsError;
  const parentsById = keyBy(parents, (parent) => parent.id);
  const states = pending.map((candidate) => ({
    candidate,
    state: getAutoPublishState({
      candidate,
      parent:
        candidate.parent_post_id === null
          ? undefined
          : parentsById[candidate.parent_post_id],
      now: options.now,
    }),
  }));

  const missed = await Promise.all(
    states.flatMap(({ candidate, state }) =>
      state.kind === "missed"
        ? [
            (async () => {
              const { data, error } = await supabase
                .from("posts")
                .update({
                  publish_claimed_at: nowIso,
                  publish_error: state.reason,
                })
                .eq("id", candidate.id)
                .is("publish_claimed_at", null)
                .is("publish_error", null)
                .select("*")
                .maybeSingle();
              if (error) throw error;
              return data;
            })(),
          ]
        : []
    )
  );
  const missedPosts = missed.flatMap((post) => (post === null ? [] : [post]));

  await Promise.all(
    [...stuck, ...missedPosts].map((post) =>
      notifyPublishOutcome({
        post,
        now: options.now,
        outcome: { kind: "failed", error: post.publish_error ?? "" },
      })
    )
  );

  const failedEarly = stuck.length + missedPosts.length;
  const finished = livePosts.length;
  const candidate = states.find(({ state }) => state.kind === "due")?.candidate;
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
