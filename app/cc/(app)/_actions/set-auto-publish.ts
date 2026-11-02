"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getIntegration } from "@/lib/cc/data/get-integration";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { prepareAutoPublish } from "@/lib/cc/prepare-auto-publish";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";

type SetAutoPublishResult = { kind: "ok" } | { kind: "error"; message: string };

const MIN_LEAD_MS = 60_000;

async function getSetupError(platform: "x" | "threads") {
  switch (platform) {
    case "x":
      return getXUserCredentials() === undefined
        ? "X posting is not set up: add the four CC_X_* keys in Vercel."
        : undefined;
    case "threads":
      return (await getIntegration({ provider: "threads" })) === undefined
        ? "Connect Threads on the Overview page first."
        : undefined;
    default: {
      const unhandled: never = platform;
      return unhandled;
    }
  }
}

/** Turn CC's auto-posting of a scheduled X or Threads post on or off, clearing an earlier failure either way; refuse to turn it on for a post that is not scheduled in the future, a platform that is not set up, or a post the platform would reject, and refuse either change while CC is posting it. */
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
  if (post.publish_claimed_at !== null && post.publish_error === null) {
    return { kind: "error", message: "CC is posting this right now." };
  }
  if (options.isOn) {
    if (!isAutoPublishPlatform(post.platform)) {
      return {
        kind: "error",
        message: "CC can only auto-post on X and Threads.",
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
  }
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      auto_publish: options.isOn,
      publish_error: null,
      publish_claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", options.postId);
  if (updateError) throw updateError;
  revalidatePath("/cc", "layout");
  return { kind: "ok" };
}
