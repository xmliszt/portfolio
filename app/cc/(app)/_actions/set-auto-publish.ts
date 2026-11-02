"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { AutoPublishPlatformId } from "@/lib/cc/auto-publish-platforms";
import { createBlueskySession } from "@/lib/cc/bluesky/create-bluesky-session";
import { findOversizedBlueskyImage } from "@/lib/cc/bluesky/find-oversized-bluesky-image";
import { getBlueskyCredentials } from "@/lib/cc/bluesky/get-bluesky-credentials";
import { getIntegration } from "@/lib/cc/data/get-integration";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { prepareAutoPublish } from "@/lib/cc/prepare-auto-publish";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { checkThreadsPublishing } from "@/lib/cc/threads/check-threads-publishing";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";

type SetAutoPublishResult = { kind: "ok" } | { kind: "error"; message: string };

const MIN_LEAD_MS = 60_000;

async function getSetupError(platform: AutoPublishPlatformId) {
  switch (platform) {
    case "x":
      return getXUserCredentials() === undefined
        ? "X posting is not set up: add the four CC_X_* keys in Vercel."
        : undefined;
    case "threads": {
      const integration = await getIntegration({ provider: "threads" });
      if (integration === undefined) {
        return "Connect Threads on the Overview page first.";
      }
      const checked = await checkThreadsPublishing({
        accessToken: integration.access_token,
      });
      if (checked.kind === "ok") return undefined;
      return checked.reason === "permission" || checked.reason === "token"
        ? "Reconnect Threads on the Overview page so CC may post."
        : `Threads did not answer: ${checked.message}`;
    }
    case "bluesky": {
      const credentials = getBlueskyCredentials();
      if (credentials === undefined) {
        return "Bluesky posting is not set up: add CC_BLUESKY_HANDLE and CC_BLUESKY_APP_PASSWORD in Vercel.";
      }
      const session = await createBlueskySession(credentials);
      return session.kind === "ok"
        ? undefined
        : `Bluesky sign-in failed: ${session.message}`;
    }
    default: {
      const unhandled: never = platform;
      return unhandled;
    }
  }
}

/** Turn CC's auto-posting of a scheduled X, Threads or Bluesky post on or off, clearing an earlier failure either way and, when off, reopening its unsent "post" reminder; refuse to turn it on for a post that is not scheduled in the future, a platform that is not set up or may not post, or a post the platform would reject, and refuse either change while CC is posting it or after the platform took it. */
export async function setAutoPublish(options: {
  postId: string;
  isOn: boolean;
}): Promise<SetAutoPublishResult> {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.postId)
    .single();
  if (error) throw error;
  if (post.platform_post_id !== null) {
    return {
      kind: "error",
      message: "CC posted this; it will show as live within 10 minutes.",
    };
  }
  if (post.status !== "draft" && post.status !== "scheduled") {
    return { kind: "error", message: "This post is no longer scheduled." };
  }
  if (post.publish_claimed_at !== null && post.publish_error === null) {
    return { kind: "error", message: "CC is posting this right now." };
  }
  if (options.isOn) {
    if (!isAutoPublishPlatform(post.platform)) {
      return {
        kind: "error",
        message: "CC can only auto-post on X, Threads and Bluesky.",
      };
    }
    if (post.kind !== "post" && post.kind !== "repost") {
      return { kind: "error", message: "Replies and comments stay manual." };
    }
    if (
      post.status !== "scheduled" ||
      post.scheduled_at === null ||
      new Date(post.scheduled_at).getTime() < Date.now() + MIN_LEAD_MS
    ) {
      return {
        kind: "error",
        message: "Schedule the post for a future time first, or use Post now.",
      };
    }
    const setupError = await getSetupError(post.platform);
    if (setupError !== undefined) return { kind: "error", message: setupError };
    const prepared = prepareAutoPublish({
      platformId: post.platform,
      text: getPostCopyText(post),
      assets: parsePostAssets(post.assets),
      target: post.target ?? undefined,
    });
    if (prepared.kind === "error") return prepared;
    const oversized =
      post.platform === "bluesky"
        ? await findOversizedBlueskyImage({ media: prepared.media })
        : undefined;
    if (oversized !== undefined) return { kind: "error", message: oversized };
  }
  const updateQuery = supabase
    .from("posts")
    .update({
      auto_publish: options.isOn,
      publish_error: null,
      publish_claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", options.postId)
    .in("status", ["draft", "scheduled"])
    .is("platform_post_id", null);
  const { data: updated, error: updateError } = await (
    post.publish_claimed_at === null
      ? updateQuery.is("publish_claimed_at", null)
      : updateQuery
          .eq("publish_claimed_at", post.publish_claimed_at)
          .not("publish_error", "is", null)
  ).select("id");
  if (updateError) throw updateError;
  if (updated.length === 0) {
    return {
      kind: "error",
      message: "The post changed while saving. Reload and try again.",
    };
  }
  if (!options.isOn) {
    const { error: reopenError } = await supabase
      .from("reminders")
      .update({ sent_at: null, done_at: null })
      .eq("post_id", options.postId)
      .eq("kind", "post")
      .is("telegram_message_id", null);
    if (reopenError) throw reopenError;
  }
  revalidatePath("/cc", "layout");
  return { kind: "ok" };
}
