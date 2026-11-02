import "server-only";

import { downloadAsset } from "@/lib/cc/data/download-asset";
import type { PublishMedia } from "@/lib/cc/publish-media";
import type { PublishResult } from "@/lib/cc/publish-result";

import { buildBlueskyFacets } from "./build-bluesky-facets";
import { callBlueskyApi } from "./call-bluesky-api";
import { createBlueskySession } from "./create-bluesky-session";
import { uploadBlueskyVideo } from "./upload-bluesky-video";

const MAX_IMAGE_BYTES = 2_000_000;

/** Sign in, upload `media`, and publish `text` with clickable links and hashtags on Bluesky; return the new post's URI and web URL, or the step that failed. */
export async function publishBlueskyPost(options: {
  handle: string;
  appPassword: string;
  text: string;
  media: readonly PublishMedia[];
}): Promise<PublishResult> {
  const signedIn = await createBlueskySession(options);
  if (signedIn.kind === "error") {
    return {
      kind: "error",
      message: `Bluesky sign-in failed: ${signedIn.message}. Check the handle and app password in Vercel.`,
    };
  }
  const session = signedIn.data;

  const embed = await (async (): Promise<
    { kind: "ok"; value: unknown } | { kind: "error"; message: string }
  > => {
    const video = options.media.find((media) => media.kind === "video");
    if (video !== undefined) {
      const uploaded = await uploadBlueskyVideo({
        session,
        bytes: await downloadAsset({ path: video.path }),
        name: video.path.split("/").at(-1) ?? "video.mp4",
      });
      if (uploaded.kind === "error") {
        return {
          kind: "error",
          message: `Bluesky video upload failed: ${uploaded.message}`,
        };
      }
      return {
        kind: "ok",
        value: {
          $type: "app.bsky.embed.video",
          video: uploaded.data,
          ...(video.alt.trim() === "" ? {} : { alt: video.alt.trim() }),
        },
      };
    }
    if (options.media.length === 0) return { kind: "ok", value: undefined };
    const images: unknown[] = [];
    for (const media of options.media) {
      const bytes = await downloadAsset({ path: media.path });
      if (bytes.size > MAX_IMAGE_BYTES) {
        return {
          kind: "error",
          message: `${media.path.split("/").at(-1)} is over Bluesky's 2 MB image limit.`,
        };
      }
      const uploaded = await callBlueskyApi<{ blob: unknown }>({
        url: new URL("/xrpc/com.atproto.repo.uploadBlob", session.pdsUrl),
        method: "POST",
        accessJwt: session.accessJwt,
        body: { kind: "bytes", value: bytes, contentType: media.mimeType },
      });
      if (uploaded.kind === "error") {
        return {
          kind: "error",
          message: `Bluesky image upload failed: ${uploaded.message}`,
        };
      }
      images.push({ image: uploaded.data.blob, alt: media.alt.trim() });
    }
    return { kind: "ok", value: { $type: "app.bsky.embed.images", images } };
  })();
  if (embed.kind === "error") return embed;

  const facets = buildBlueskyFacets(options.text);
  const created = await callBlueskyApi<{ uri: string; cid: string }>({
    url: new URL("/xrpc/com.atproto.repo.createRecord", session.pdsUrl),
    method: "POST",
    accessJwt: session.accessJwt,
    body: {
      kind: "json",
      value: {
        repo: session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: options.text,
          createdAt: new Date().toISOString(),
          ...(facets.length === 0 ? {} : { facets }),
          ...(embed.value === undefined ? {} : { embed: embed.value }),
        },
      },
    },
  });
  if (created.kind === "error") {
    return {
      kind: "error",
      message:
        created.status === 0
          ? `Lost the connection to Bluesky while posting (${created.message}), so it may or may not be live. Check Bluesky before you post again.`
          : `Bluesky (${created.status}): ${created.message}`,
    };
  }
  const recordKey = created.data.uri.split("/").at(-1);
  return {
    kind: "ok",
    platformPostId: created.data.uri,
    url:
      recordKey === undefined
        ? undefined
        : `https://bsky.app/profile/${session.did}/post/${recordKey}`,
  };
}
