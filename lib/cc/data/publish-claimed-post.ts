import "server-only";

import { appendLink } from "@/lib/cc/append-link";
import { getBlueskyCredentials } from "@/lib/cc/bluesky/get-bluesky-credentials";
import { publishBlueskyPost } from "@/lib/cc/bluesky/publish-bluesky-post";
import { repostBlueskyPost } from "@/lib/cc/bluesky/repost-bluesky-post";
import { resolveBlueskyReplyRef } from "@/lib/cc/bluesky/resolve-bluesky-reply-ref";
import { PARENT_NOT_AUTO_POSTED } from "@/lib/cc/get-auto-publish-state";
import { getPostCopyText } from "@/lib/cc/get-post-copy-text";
import { getRepostMode } from "@/lib/cc/get-repost-mode";
import { isAutoPublishPlatform } from "@/lib/cc/is-auto-publish-platform";
import { parsePostAssets } from "@/lib/cc/parse-post-assets";
import {
  prepareAutoPublish,
  type PreparedPost,
} from "@/lib/cc/prepare-auto-publish";
import type { PublishResult } from "@/lib/cc/publish-result";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { findThreadsMediaId } from "@/lib/cc/threads/find-threads-media-id";
import { publishThreadsPost } from "@/lib/cc/threads/publish-threads-post";
import { repostThreadsPost } from "@/lib/cc/threads/repost-threads-post";
import { getXUserCredentials } from "@/lib/cc/x/get-x-user-credentials";
import { parseXCommunityId } from "@/lib/cc/x/parse-x-community-id";
import { parseXStatusId } from "@/lib/cc/x/parse-x-status-id";
import { publishXPost } from "@/lib/cc/x/publish-x-post";
import { repostXPost } from "@/lib/cc/x/repost-x-post";

import type { PostRow } from "./cc-rows";
import { getIntegration } from "./get-integration";
import { loadReplyTarget } from "./load-reply-target";
import { loadRepostOriginal } from "./load-repost-original";
import { markPostLive } from "./mark-post-live";
import { notifyPublishOutcome } from "./notify-publish-outcome";

type Ref<T> = { kind: "ok"; value: T } | { kind: "error"; message: string };

function resolveXPostId(post: PostRow): Ref<string> {
  const id =
    post.platform_post_id ??
    (post.url === null ? undefined : parseXStatusId(post.url));
  return id === undefined
    ? {
        kind: "error",
        message: "CC could not find that X post. Paste its live link.",
      }
    : { kind: "ok", value: id };
}

async function resolveThreadsMediaId(options: {
  post: PostRow;
  accessToken: string;
}): Promise<Ref<string>> {
  if (options.post.platform_post_id !== null) {
    return { kind: "ok", value: options.post.platform_post_id };
  }
  if (options.post.url === null) {
    return {
      kind: "error",
      message: "CC could not find that Threads post. Paste its live link.",
    };
  }
  const found = await findThreadsMediaId({
    accessToken: options.accessToken,
    permalink: options.post.url,
  });
  return found.kind === "ok" ? { kind: "ok", value: found.id } : found;
}

async function publishOnPlatform(options: {
  post: PostRow;
  now: Date;
}): Promise<PublishResult> {
  const post = options.post;
  if (!isAutoPublishPlatform(post.platform)) {
    return { kind: "error", message: "CC cannot post on this platform." };
  }
  const mode = getRepostMode(post);
  const original =
    mode === "post" ? undefined : await loadRepostOriginal({ post });
  if (original?.kind === "error") return original;
  const originalPost = original?.original;
  const copyText = getPostCopyText(post);
  const text =
    mode === "quote" && post.platform === "x" && originalPost?.url
      ? appendLink({ text: copyText, link: originalPost.url })
      : copyText;
  const prepared =
    mode === "repost"
      ? ({
          kind: "ok",
          text: "",
          media: [],
          topicTag: undefined,
        } satisfies PreparedPost)
      : prepareAutoPublish({
          platformId: post.platform,
          text,
          assets: parsePostAssets(post.assets),
          target: post.target ?? undefined,
        });
  if (prepared.kind === "error") return prepared;
  const replyTarget = await loadReplyTarget({ post });
  if (replyTarget.kind === "error") return replyTarget;
  const target = replyTarget.kind === "ok" ? replyTarget.target : undefined;
  switch (post.platform) {
    case "x": {
      const credentials = getXUserCredentials();
      if (credentials === undefined) {
        return { kind: "error", message: "X posting is not set up in Vercel." };
      }
      if (mode === "repost" && originalPost !== undefined) {
        const originalId = resolveXPostId(originalPost);
        if (originalId.kind === "error") return originalId;
        return repostXPost({ credentials, postId: originalId.value });
      }
      const replyTo = target === undefined ? undefined : resolveXPostId(target);
      if (replyTo?.kind === "error") return replyTo;
      const communityId =
        target === undefined && post.target !== null
          ? parseXCommunityId(post.target)
          : undefined;
      if (
        target === undefined &&
        post.target !== null &&
        communityId === undefined
      ) {
        return {
          kind: "error",
          message:
            "The X community must be its id or its x.com/i/communities link.",
        };
      }
      return publishXPost({
        credentials,
        text: prepared.text,
        media: prepared.media,
        replyToId: replyTo?.value,
        communityId,
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
      const accessToken = integration.access_token;
      const originalId =
        originalPost === undefined
          ? undefined
          : await resolveThreadsMediaId({ post: originalPost, accessToken });
      if (originalId?.kind === "error") return originalId;
      if (mode === "repost" && originalId !== undefined) {
        return repostThreadsPost({
          accessToken,
          mediaId: originalId.value,
          permalink: originalPost?.url ?? undefined,
        });
      }
      const replyTo =
        target === undefined
          ? undefined
          : await resolveThreadsMediaId({ post: target, accessToken });
      if (replyTo?.kind === "error") return replyTo;
      return publishThreadsPost({
        accessToken,
        text: prepared.text,
        media: prepared.media,
        topicTag: target === undefined ? prepared.topicTag : undefined,
        replyToId: replyTo?.value,
        quotePostId: mode === "quote" ? originalId?.value : undefined,
      });
    }
    case "bluesky": {
      const credentials = getBlueskyCredentials();
      if (credentials === undefined) {
        return {
          kind: "error",
          message: "Bluesky posting is not set up in Vercel.",
        };
      }
      const originalRef =
        originalPost === undefined
          ? undefined
          : await resolveBlueskyReplyRef({
              uri: originalPost.platform_post_id,
              url: originalPost.url,
            });
      if (originalRef?.kind === "error") return originalRef;
      if (mode === "repost" && originalRef !== undefined) {
        return repostBlueskyPost({
          ...credentials,
          subject: originalRef.ref.parent,
          originalUrl: originalPost?.url ?? undefined,
        });
      }
      const replyTo =
        target === undefined
          ? undefined
          : await resolveBlueskyReplyRef({
              uri: target.platform_post_id,
              url: target.url,
            });
      if (replyTo?.kind === "error") return replyTo;
      return publishBlueskyPost({
        ...credentials,
        text: prepared.text,
        media: prepared.media,
        replyTo: replyTo?.ref,
        quote: mode === "quote" ? originalRef?.ref.parent : undefined,
      });
    }
    default: {
      const unhandled: never = post.platform;
      return unhandled;
    }
  }
}

/** Publish a post this run has claimed through `publish_claimed_at`: store the platform's post id as soon as it exists, then mark the post live, close the reminders of a plain repost, and re-arm its replies that failed only because it had not posted; on failure store `publish_error`, keeping the claim so no later run posts it twice; message the owner either way. */
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
        .update({ platform_post_id: result.platformPostId })
        .eq("id", options.post.id);
      if (error) throw error;
      const { error: urlError } = await supabase
        .from("posts")
        .update({ url: result.url ?? null })
        .eq("id", options.post.id)
        .neq("status", "posted");
      if (urlError) throw urlError;
      await markPostLive({
        postId: options.post.id,
        url: result.url,
        platformPostId: result.platformPostId,
      });
      if (getRepostMode(options.post) === "repost") {
        const { error: closeError } = await supabase
          .from("reminders")
          .update({ done_at: new Date().toISOString() })
          .eq("post_id", options.post.id)
          .is("done_at", null);
        if (closeError) throw closeError;
      }
      const { error: rearmError } = await supabase
        .from("posts")
        .update({ publish_claimed_at: null, publish_error: null })
        .eq("parent_post_id", options.post.id)
        .eq("status", "scheduled")
        .eq("publish_error", PARENT_NOT_AUTO_POSTED)
        .is("platform_post_id", null);
      if (rearmError) throw rearmError;
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
