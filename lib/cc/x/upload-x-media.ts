import "server-only";

import type { PublishMedia } from "@/lib/cc/publish-media";
import { wait } from "@/lib/cc/wait";

import { callXApi, type XApiResult } from "./call-x-api";
import type { XUserCredentials } from "./x-user-credentials";

const X_API_ORIGIN = "https://api.x.com";
const CHUNK_BYTES = 4 * 1024 * 1024;
const MAX_PROCESSING_WAIT_MS = 4 * 60_000;

type ProcessingInfo = { state: string; check_after_secs?: number };
type MediaData = { data: { id: string; processing_info?: ProcessingInfo } };

async function waitForProcessing(options: {
  credentials: XUserCredentials;
  mediaId: string;
  processingInfo: ProcessingInfo | undefined;
}): Promise<XApiResult<undefined>> {
  const startedAt = Date.now();
  let info = options.processingInfo;
  while (info !== undefined && info.state !== "succeeded") {
    if (info.state === "failed") {
      return {
        kind: "error",
        status: 0,
        message: "X could not process the media",
      };
    }
    if (Date.now() - startedAt > MAX_PROCESSING_WAIT_MS) {
      return {
        kind: "error",
        status: 0,
        message: "X took too long to process the media",
      };
    }
    await wait((info.check_after_secs ?? 2) * 1000);
    const url = new URL("/2/media/upload", X_API_ORIGIN);
    url.searchParams.set("command", "STATUS");
    url.searchParams.set("media_id", options.mediaId);
    const status = await callXApi<MediaData>({
      method: "GET",
      url,
      credentials: options.credentials,
    });
    if (status.kind === "error") return status;
    info = status.data.data.processing_info;
  }
  return { kind: "ok", data: undefined };
}

async function uploadChunked(options: {
  credentials: XUserCredentials;
  media: PublishMedia;
  bytes: Blob;
}): Promise<XApiResult<MediaData>> {
  const initialized = await callXApi<MediaData>({
    method: "POST",
    url: new URL("/2/media/upload/initialize", X_API_ORIGIN),
    credentials: options.credentials,
    body: {
      kind: "json",
      value: {
        media_type: options.media.mimeType,
        total_bytes: options.bytes.size,
        media_category:
          options.media.kind === "gif" ? "tweet_gif" : "tweet_video",
      },
    },
  });
  if (initialized.kind === "error") return initialized;
  const mediaId = initialized.data.data.id;
  const chunkCount = Math.ceil(options.bytes.size / CHUNK_BYTES);
  for (const index of Array.from({ length: chunkCount }, (_, i) => i)) {
    const form = new FormData();
    form.set("segment_index", String(index));
    form.set(
      "media",
      options.bytes.slice(index * CHUNK_BYTES, (index + 1) * CHUNK_BYTES)
    );
    const appended = await callXApi<unknown>({
      method: "POST",
      url: new URL(`/2/media/upload/${mediaId}/append`, X_API_ORIGIN),
      credentials: options.credentials,
      body: { kind: "form", value: form },
    });
    if (appended.kind === "error") return appended;
  }
  return callXApi<MediaData>({
    method: "POST",
    url: new URL(`/2/media/upload/${mediaId}/finalize`, X_API_ORIGIN),
    credentials: options.credentials,
  });
}

/** Upload one media file to X as the owner, wait until X has processed it, set its alt text, and return its media id. */
export async function uploadXMedia(options: {
  credentials: XUserCredentials;
  media: PublishMedia;
  bytes: Blob;
}): Promise<XApiResult<string>> {
  const uploaded =
    options.media.kind === "image"
      ? await callXApi<MediaData>({
          method: "POST",
          url: new URL("/2/media/upload", X_API_ORIGIN),
          credentials: options.credentials,
          body: {
            kind: "json",
            value: {
              media: Buffer.from(await options.bytes.arrayBuffer()).toString(
                "base64"
              ),
              media_category: "tweet_image",
            },
          },
        })
      : await uploadChunked(options);
  if (uploaded.kind === "error") return uploaded;
  const mediaId = uploaded.data.data.id;
  const processed = await waitForProcessing({
    credentials: options.credentials,
    mediaId,
    processingInfo: uploaded.data.data.processing_info,
  });
  if (processed.kind === "error") return processed;
  const alt = options.media.alt.trim();
  if (alt !== "") {
    const described = await callXApi<unknown>({
      method: "POST",
      url: new URL("/2/media/metadata", X_API_ORIGIN),
      credentials: options.credentials,
      body: {
        kind: "json",
        value: {
          id: mediaId,
          metadata: { alt_text: { text: alt.slice(0, 1000) } },
        },
      },
    });
    if (described.kind === "error") return described;
  }
  return { kind: "ok", data: mediaId };
}
