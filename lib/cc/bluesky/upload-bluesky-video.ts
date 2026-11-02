import "server-only";

import { wait } from "@/lib/cc/wait";

import type { BlobRef } from "./blob-ref";
import type { BlueskySession } from "./bluesky-session";
import { type BlueskyApiResult, callBlueskyApi } from "./call-bluesky-api";
import { readBlobRef } from "./read-blob-ref";

const VIDEO_SERVICE = "https://video.bsky.app";
const POLL_MS = 3_000;
const MAX_PROCESSING_MS = 4 * 60_000;

type JobStatus = {
  jobId?: string;
  state?: string;
  error?: string;
  message?: string;
};

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

function readJobStatus(body: unknown): JobStatus {
  const status =
    isObject(body) && isObject(body.jobStatus) ? body.jobStatus : body;
  if (!isObject(status)) return {};
  function read(key: string) {
    const value = isObject(status) ? status[key] : undefined;
    return typeof value === "string" ? value : undefined;
  }
  return {
    jobId: read("jobId"),
    state: read("state"),
    error: read("error"),
    message: read("message"),
  };
}

/** Upload an MP4 to Bluesky's video service for `session`'s account, wait until it is processed, and return its blob reference; a video the service already has returns its earlier blob. */
export async function uploadBlueskyVideo(options: {
  session: BlueskySession;
  bytes: Blob;
  name: string;
}): Promise<BlueskyApiResult<BlobRef>> {
  const authUrl = new URL(
    "/xrpc/com.atproto.server.getServiceAuth",
    options.session.pdsUrl
  );
  authUrl.searchParams.set(
    "aud",
    `did:web:${new URL(options.session.pdsUrl).host}`
  );
  authUrl.searchParams.set("lxm", "com.atproto.repo.uploadBlob");
  authUrl.searchParams.set(
    "exp",
    String(Math.floor(Date.now() / 1000) + 30 * 60)
  );
  const auth = await callBlueskyApi<{ token: string }>({
    url: authUrl,
    method: "GET",
    accessJwt: options.session.accessJwt,
  });
  if (auth.kind === "error") return auth;

  const uploadUrl = new URL("/xrpc/app.bsky.video.uploadVideo", VIDEO_SERVICE);
  uploadUrl.searchParams.set("did", options.session.did);
  uploadUrl.searchParams.set("name", options.name);
  const uploaded = await callBlueskyApi<unknown>({
    url: uploadUrl,
    method: "POST",
    accessJwt: auth.data.token,
    body: { kind: "bytes", value: options.bytes, contentType: "video/mp4" },
  });
  const uploadBody = uploaded.kind === "ok" ? uploaded.data : uploaded.body;
  const existingBlob = readBlobRef(uploadBody);
  if (existingBlob !== undefined) return { kind: "ok", data: existingBlob };
  const jobId = readJobStatus(uploadBody).jobId;
  if (jobId === undefined) {
    return uploaded.kind === "error"
      ? uploaded
      : {
          kind: "error",
          status: 0,
          message: "Bluesky returned no video job",
          body: uploadBody,
        };
  }

  const deadlineMs = Date.now() + MAX_PROCESSING_MS;
  while (Date.now() <= deadlineMs) {
    await wait(POLL_MS);
    const statusUrl = new URL(
      "/xrpc/app.bsky.video.getJobStatus",
      VIDEO_SERVICE
    );
    statusUrl.searchParams.set("jobId", jobId);
    const status = await callBlueskyApi<unknown>({
      url: statusUrl,
      method: "GET",
    });
    if (status.kind === "error") return status;
    const blob = readBlobRef(status.data);
    if (blob !== undefined) return { kind: "ok", data: blob };
    const job = readJobStatus(status.data);
    if (
      job.state === "JOB_STATE_FAILED" ||
      job.state === "JOB_STATE_COMPLETED"
    ) {
      return {
        kind: "error",
        status: 0,
        message: `Bluesky could not process the video: ${job.message ?? job.error ?? job.state}`,
        body: job,
      };
    }
  }
  return {
    kind: "error",
    status: 0,
    message: "Bluesky took too long to process the video",
    body: undefined,
  };
}
