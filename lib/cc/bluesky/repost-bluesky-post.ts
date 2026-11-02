import "server-only";

import type { PublishResult } from "@/lib/cc/publish-result";

import { callBlueskyApi } from "./call-bluesky-api";
import { createBlueskySession } from "./create-bluesky-session";

/** Sign in and repost the Bluesky post `subject` (URI and CID) with no text of its own; return the repost record's URI and the original's web URL, or the step that failed. */
export async function repostBlueskyPost(options: {
  handle: string;
  appPassword: string;
  subject: { uri: string; cid: string };
  originalUrl: string | undefined;
}): Promise<PublishResult> {
  const signedIn = await createBlueskySession(options);
  if (signedIn.kind === "error") {
    return {
      kind: "error",
      message: `Bluesky sign-in failed: ${signedIn.message}.`,
    };
  }
  const created = await callBlueskyApi<{ uri: string }>({
    url: new URL("/xrpc/com.atproto.repo.createRecord", signedIn.data.pdsUrl),
    method: "POST",
    accessJwt: signedIn.data.accessJwt,
    body: {
      kind: "json",
      value: {
        repo: signedIn.data.did,
        collection: "app.bsky.feed.repost",
        record: {
          $type: "app.bsky.feed.repost",
          subject: options.subject,
          createdAt: new Date().toISOString(),
        },
      },
    },
  });
  if (created.kind === "error") {
    return {
      kind: "error",
      message:
        created.status === 0
          ? `Lost the connection to Bluesky while reposting (${created.message}), so it may or may not be reposted. Check Bluesky before you try again.`
          : `Bluesky (${created.status}): ${created.message}`,
    };
  }
  return {
    kind: "ok",
    platformPostId: created.data.uri,
    url: options.originalUrl,
  };
}
