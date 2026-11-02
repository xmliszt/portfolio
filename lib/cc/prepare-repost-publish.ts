import type { Json } from "./supabase/__generated__/types";
import { resolveXPostId } from "./x/resolve-x-post-id";
import { appendLink } from "./append-link";
import type { AutoPublishPlatformId } from "./auto-publish-platforms";
import { getPostCopyText } from "./get-post-copy-text";
import { getRepostMode } from "./get-repost-mode";
import { parsePostAssets } from "./parse-post-assets";
import { prepareAutoPublish, type PreparedPost } from "./prepare-auto-publish";

type PublishPost = {
  kind: string;
  repost_as: string;
  body: string;
  hashtags: string[];
  assets: Json;
  target: string | null;
};

type OriginalPost = { platform_post_id: string | null; url: string | null };

type RepostPublishPlan<T extends OriginalPost> =
  | { kind: "post" }
  | { kind: "quote"; original: T }
  | { kind: "repost"; original: T };

/** Return how `post` goes out on `platformId` (a new post, a quote of `original`, or a plain repost of it) with the text, media and topic to send, or why it cannot; an X quote gets the original's status link added to its text. */
export function prepareRepostPublish<T extends OriginalPost>(options: {
  post: PublishPost;
  platformId: AutoPublishPlatformId;
  original: T | undefined;
}):
  | {
      kind: "ok";
      plan: RepostPublishPlan<T>;
      prepared: Extract<PreparedPost, { kind: "ok" }>;
    }
  | { kind: "error"; message: string } {
  const mode = getRepostMode(options.post);
  const plan = ((): RepostPublishPlan<T> | undefined => {
    switch (mode) {
      case "post":
        return { kind: "post" };
      case "quote":
      case "repost":
        return options.original === undefined
          ? undefined
          : { kind: mode, original: options.original };
      default: {
        const unhandled: never = mode;
        return unhandled;
      }
    }
  })();
  if (plan === undefined) {
    return {
      kind: "error",
      message:
        "The original post is not live, so there is nothing to quote or repost.",
    };
  }
  if (plan.kind === "repost") {
    return {
      kind: "ok",
      plan,
      prepared: { kind: "ok", text: "", media: [], topicTag: undefined },
    };
  }
  const copyText = getPostCopyText(options.post);
  const text = (():
    | { kind: "ok"; value: string }
    | { kind: "error"; message: string } => {
    if (plan.kind !== "quote" || options.platformId !== "x") {
      return { kind: "ok", value: copyText };
    }
    const originalId = resolveXPostId(plan.original);
    return originalId.kind === "error"
      ? originalId
      : {
          kind: "ok",
          value: appendLink({
            text: copyText,
            link: `https://x.com/i/web/status/${originalId.value}`,
          }),
        };
  })();
  if (text.kind === "error") return text;
  const prepared = prepareAutoPublish({
    platformId: options.platformId,
    text: text.value,
    assets: parsePostAssets(options.post.assets),
    target: options.post.target ?? undefined,
  });
  return prepared.kind === "error" ? prepared : { kind: "ok", plan, prepared };
}
