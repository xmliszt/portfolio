import "server-only";

import type { BlueskyReplyRef } from "./bluesky-reply-ref";
import { callBlueskyApi } from "./call-bluesky-api";
import { parseBlueskyPostUrl } from "./parse-bluesky-post-url";

const PUBLIC_API = "https://public.api.bsky.app";

type PostView = {
  uri: string;
  cid: string;
  record?: { reply?: { root?: { uri?: string; cid?: string } } };
};

async function toPostUri(options: { uri: string | null; url: string | null }) {
  if (options.uri?.startsWith("at://")) return options.uri;
  const parsed =
    options.url === null ? undefined : parseBlueskyPostUrl(options.url);
  if (parsed === undefined) return undefined;
  if (parsed.actor.startsWith("did:")) {
    return `at://${parsed.actor}/app.bsky.feed.post/${parsed.recordKey}`;
  }
  const url = new URL("/xrpc/com.atproto.identity.resolveHandle", PUBLIC_API);
  url.searchParams.set("handle", parsed.actor);
  const resolved = await callBlueskyApi<{ did: string }>({
    url,
    method: "GET",
  });
  return resolved.kind === "ok"
    ? `at://${resolved.data.did}/app.bsky.feed.post/${parsed.recordKey}`
    : undefined;
}

/** Return the reply references for answering the Bluesky post stored as `uri` or linked by `url`: the post itself as parent and its thread's top post as root; or why it could not be found. */
export async function resolveBlueskyReplyRef(options: {
  uri: string | null;
  url: string | null;
}): Promise<
  { kind: "ok"; ref: BlueskyReplyRef } | { kind: "error"; message: string }
> {
  const uri = await toPostUri(options);
  if (uri === undefined) {
    return {
      kind: "error",
      message:
        "CC could not find the Bluesky post to reply to. Paste its live link.",
    };
  }
  const url = new URL("/xrpc/app.bsky.feed.getPosts", PUBLIC_API);
  url.searchParams.set("uris", uri);
  const found = await callBlueskyApi<{ posts: PostView[] }>({
    url,
    method: "GET",
  });
  const post = found.kind === "ok" ? found.data.posts.at(0) : undefined;
  if (post === undefined) {
    return {
      kind: "error",
      message: "Bluesky did not return the post to reply to.",
    };
  }
  const parent = { uri: post.uri, cid: post.cid };
  const root = post.record?.reply?.root;
  return {
    kind: "ok",
    ref: {
      parent,
      root:
        root?.uri === undefined || root.cid === undefined
          ? parent
          : { uri: root.uri, cid: root.cid },
    },
  };
}
