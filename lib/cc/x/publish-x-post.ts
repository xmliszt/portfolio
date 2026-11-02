import "server-only";

import { downloadAsset } from "@/lib/cc/data/download-asset";
import type { PublishMedia } from "@/lib/cc/publish-media";
import type { PublishResult } from "@/lib/cc/publish-result";

import { callXApi } from "./call-x-api";
import { uploadXMedia } from "./upload-x-media";
import type { XUserCredentials } from "./x-user-credentials";

/** Upload `media` and publish `text` with it on X as the owner, and return the new post's id and URL, or X's error. */
export async function publishXPost(options: {
  credentials: XUserCredentials;
  text: string;
  media: readonly PublishMedia[];
}): Promise<PublishResult> {
  const mediaIds: string[] = [];
  for (const media of options.media) {
    const uploaded = await uploadXMedia({
      credentials: options.credentials,
      media,
      bytes: await downloadAsset({ path: media.path }),
    });
    if (uploaded.kind === "error") {
      return {
        kind: "error",
        message: `X refused ${media.path.split("/").at(-1)}: ${uploaded.message}`,
      };
    }
    mediaIds.push(uploaded.data);
  }
  const created = await callXApi<{ data: { id: string } }>({
    method: "POST",
    url: new URL("https://api.x.com/2/tweets"),
    credentials: options.credentials,
    body: {
      kind: "json",
      value: {
        text: options.text,
        ...(mediaIds.length === 0 ? {} : { media: { media_ids: mediaIds } }),
      },
    },
  });
  if (created.kind === "error") {
    return {
      kind: "error",
      message:
        created.status === 0
          ? `Lost the connection to X while posting (${created.message}), so it may or may not be live. Check X before you post again.`
          : `X (${created.status}): ${created.message}`,
    };
  }
  const id = created.data.data.id;
  return {
    kind: "ok",
    platformPostId: id,
    url: `https://x.com/i/web/status/${id}`,
  };
}
