import "server-only";

import { signAssetUrls } from "@/lib/cc/data/sign-asset-urls";
import type { PublishMedia } from "@/lib/cc/publish-media";
import type { PublishResult } from "@/lib/cc/publish-result";
import { wait } from "@/lib/cc/wait";

import { callThreadsApi } from "./call-threads-api";
import { THREADS_GRAPH_ORIGIN } from "./threads-api";
import type { ThreadsApiResult } from "./threads-api-result";

const MEDIA_LINK_EXPIRES_IN_S = 60 * 60;
const STATUS_POLL_MS = 5_000;
const MAX_STATUS_WAIT_MS = 4 * 60_000;

type ContainerStatus = { status?: string; error_message?: string };

function describeError(options: {
  step: string;
  result: ThreadsApiResult<unknown>;
}) {
  if (options.result.kind === "ok") return "";
  const hint =
    options.result.reason === "permission" || options.result.reason === "token"
      ? " Reconnect Threads in CC so it can post."
      : "";
  return `Threads ${options.step} failed: ${options.result.message}.${hint}`;
}

async function createContainer(options: {
  accessToken: string;
  params: { [name: string]: string };
}) {
  const url = new URL("/v1.0/me/threads", THREADS_GRAPH_ORIGIN);
  Object.entries(options.params).forEach(([name, value]) =>
    url.searchParams.set(name, value)
  );
  url.searchParams.set("access_token", options.accessToken);
  return callThreadsApi<{ id: string }>({ url, init: { method: "POST" } });
}

async function waitUntilFinished(options: {
  accessToken: string;
  containerId: string;
}): Promise<string | undefined> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < MAX_STATUS_WAIT_MS) {
    const url = new URL(`/v1.0/${options.containerId}`, THREADS_GRAPH_ORIGIN);
    url.searchParams.set("fields", "status,error_message");
    url.searchParams.set("access_token", options.accessToken);
    const checked = await callThreadsApi<ContainerStatus>({ url });
    if (checked.kind === "error") {
      return describeError({ step: "status check", result: checked });
    }
    switch (checked.data.status) {
      case "FINISHED":
        return undefined;
      case "ERROR":
      case "EXPIRED":
        return `Threads could not process the media: ${checked.data.error_message ?? checked.data.status}.`;
      default:
        await wait(STATUS_POLL_MS);
    }
  }
  return "Threads took too long to process the media.";
}

function toMediaParams(options: { media: PublishMedia; url: string }) {
  return {
    media_type: options.media.kind === "video" ? "VIDEO" : "IMAGE",
    [options.media.kind === "video" ? "video_url" : "image_url"]: options.url,
    ...(options.media.alt.trim() === ""
      ? {}
      : { alt_text: options.media.alt.trim().slice(0, 1000) }),
  };
}

/** Create the Threads container for `text` and `media` (a carousel for two or more files), wait until Threads has processed it, publish it, and return the new post's id and permalink, or the step that failed. */
export async function publishThreadsPost(options: {
  accessToken: string;
  text: string;
  media: readonly PublishMedia[];
  topicTag: string | undefined;
}): Promise<PublishResult> {
  const urls = await signAssetUrls({
    paths: options.media.map((media) => media.path),
    expiresInS: MEDIA_LINK_EXPIRES_IN_S,
    isDownload: false,
  });
  const missing = options.media.find((media) => urls[media.path] === undefined);
  if (missing !== undefined) {
    return {
      kind: "error",
      message: `The file ${missing.path} is missing from storage.`,
    };
  }
  const shared = {
    ...(options.text.trim() === "" ? {} : { text: options.text }),
    ...(options.topicTag === undefined ? {} : { topic_tag: options.topicTag }),
  };

  const container = await (async (): Promise<
    ThreadsApiResult<{ id: string }>
  > => {
    if (options.media.length === 0) {
      return createContainer({
        accessToken: options.accessToken,
        params: { media_type: "TEXT", ...shared },
      });
    }
    if (options.media.length === 1) {
      const [media] = options.media;
      return createContainer({
        accessToken: options.accessToken,
        params: {
          ...toMediaParams({ media, url: urls[media.path] }),
          ...shared,
        },
      });
    }
    const childIds: string[] = [];
    for (const media of options.media) {
      const child = await createContainer({
        accessToken: options.accessToken,
        params: {
          ...toMediaParams({ media, url: urls[media.path] }),
          is_carousel_item: "true",
        },
      });
      if (child.kind === "error") return child;
      const childError = await waitUntilFinished({
        accessToken: options.accessToken,
        containerId: child.data.id,
      });
      if (childError !== undefined) {
        return {
          kind: "error",
          reason: "other",
          status: 0,
          message: childError,
        };
      }
      childIds.push(child.data.id);
    }
    return createContainer({
      accessToken: options.accessToken,
      params: {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        ...shared,
      },
    });
  })();
  if (container.kind === "error") {
    return {
      kind: "error",
      message: describeError({ step: "upload", result: container }),
    };
  }
  const containerError = await waitUntilFinished({
    accessToken: options.accessToken,
    containerId: container.data.id,
  });
  if (containerError !== undefined)
    return { kind: "error", message: containerError };

  const publishUrl = new URL("/v1.0/me/threads_publish", THREADS_GRAPH_ORIGIN);
  publishUrl.searchParams.set("creation_id", container.data.id);
  publishUrl.searchParams.set("access_token", options.accessToken);
  const published = await callThreadsApi<{ id: string }>({
    url: publishUrl,
    init: { method: "POST" },
  });
  if (published.kind === "error") {
    return {
      kind: "error",
      message: describeError({ step: "publish", result: published }),
    };
  }

  const permalinkUrl = new URL(
    `/v1.0/${published.data.id}`,
    THREADS_GRAPH_ORIGIN
  );
  permalinkUrl.searchParams.set("fields", "permalink");
  permalinkUrl.searchParams.set("access_token", options.accessToken);
  const permalink = await callThreadsApi<{ permalink?: string }>({
    url: permalinkUrl,
  });
  return {
    kind: "ok",
    platformPostId: published.data.id,
    url: permalink.kind === "ok" ? permalink.data.permalink : undefined,
  };
}
