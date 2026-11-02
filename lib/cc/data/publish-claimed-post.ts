import "server-only";

import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import { prepareAutoPublish } from "@/lib/cc/prepare-auto-publish";
import type { PublishResult } from "@/lib/cc/publish-result";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { publishThreadsPost } from "@/lib/cc/threads/publish-threads-post";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";
import { publishXPost } from "@/lib/cc/x/publish-x-post";

import type { PostRow } from "./cc-rows";
import { getIntegration } from "./get-integration";
import { markPostLive } from "./mark-post-live";
import { notifyPublishOutcome } from "./notify-publish-outcome";

async function publishOnPlatform(options: {
  post: PostRow;
  now: Date;
}): Promise<PublishResult> {
  const post = options.post;
  if (!isAutoPublishPlatform(post.platform)) {
    return { kind: "error", message: "CC cannot post on this platform." };
  }
  const prepared = prepareAutoPublish({
    platformId: post.platform,
    text: getPostCopyText(post),
    assets: parsePostAssets(post.assets),
    target: post.target ?? undefined,
  });
  if (prepared.kind === "error") return prepared;
  switch (post.platform) {
    case "x": {
      const credentials = getXUserCredentials();
      if (credentials === undefined) {
        return { kind: "error", message: "X posting is not set up in Vercel." };
      }
      return publishXPost({
        credentials,
        text: prepared.text,
        media: prepared.media,
      });
    }
    case "threads": {
      const integration = await getIntegration({ provider: "threads" });
      if (
        integration === undefined ||
        (integration.expires_at !== null &&
          new Date(integration.expires_at) <= options.now)
      ) {
        return {
          kind: "error",
          message: "Threads is not connected. Reconnect it in CC.",
        };
      }
      return publishThreadsPost({
        accessToken: integration.access_token,
        text: prepared.text,
        media: prepared.media,
        topicTag: prepared.topicTag,
      });
    }
    default: {
      const unhandled: never = post.platform;
      return unhandled;
    }
  }
}

/** Publish a post this run has claimed through `publish_claimed_at`: store the platform's post id as soon as it exists, then mark the post live; on failure store `publish_error`, keeping the claim so no later run posts it twice; message the owner either way. */
export async function publishClaimedPost(options: {
  post: PostRow;
  now: Date;
}) {
  const supabase = createCcServiceClient();
  const result = await publishOnPlatform(options).catch(
    (error: unknown): PublishResult => ({
      kind: "error",
      message: error instanceof Error ? error.message : String(error),
    })
  );
  switch (result.kind) {
    case "ok": {
      const { error } = await supabase
        .from("posts")
        .update({
          platform_post_id: result.platformPostId,
          url: result.url ?? null,
        })
        .eq("id", options.post.id);
      if (error) throw error;
      await markPostLive({
        postId: options.post.id,
        url: result.url,
        platformPostId: result.platformPostId,
      });
      await notifyPublishOutcome({
        post: options.post,
        now: options.now,
        outcome: { kind: "posted", url: result.url },
      });
      return result;
    }
    case "error": {
      const { error } = await supabase
        .from("posts")
        .update({ publish_error: result.message })
        .eq("id", options.post.id);
      if (error) throw error;
      await notifyPublishOutcome({
        post: options.post,
        now: options.now,
        outcome: { kind: "failed", error: result.message },
      });
      return result;
    }
    default: {
      const unhandled: never = result;
      return unhandled;
    }
  }
}
