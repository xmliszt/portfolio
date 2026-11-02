import "server-only";

import { wait } from "@/lib/cc/wait";

import type { BlueskySession } from "./bluesky-session";
import { type BlueskyApiResult, callBlueskyApi } from "./call-bluesky-api";

const VIDEO_SERVICE = "https://video.bsky.app";
const POLL_MS = 3_000;
const MAX_PROCESSING_MS = 4 * 60_000;

type JobStatus = {
  jobId: string;
  state: string;
  blob?: unknown;
  error?: string;
  message?: string;
};

function readJobStatus(
  body: { jobStatus?: JobStatus } & Partial<JobStatus>
): JobStatus | undefined {
  if (body.jobStatus !== undefined) return body.jobStatus;
  if (body.jobId === undefined || body.state === undefined) return undefined;
  return {
    jobId: body.jobId,
    state: body.state,
    blob: body.blob,
    error: body.error,
    message: body.message,
  };
}

/** Upload an MP4 to Bluesky's video service for `session`'s account, wait until it is processed, and return its blob reference for a post embed. */
export async function uploadBlueskyVideo(options: {
  session: BlueskySession;
  bytes: Blob;
  name: string;
}): Promise<BlueskyApiResult<unknown>> {
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
  const uploaded = await callBlueskyApi<
    { jobStatus?: JobStatus } & Partial<JobStatus>
  >({
    url: uploadUrl,
    method: "POST",
    accessJwt: auth.data.token,
    body: { kind: "bytes", value: options.bytes, contentType: "video/mp4" },
  });
  if (uploaded.kind === "error") return uploaded;
  const first = readJobStatus(uploaded.data);
  if (first === undefined) {
    return {
      kind: "error",
      status: 0,
      message: "Bluesky returned no video job",
    };
  }

  const deadlineMs = Date.now() + MAX_PROCESSING_MS;
  let job = first;
  while (job.state !== "JOB_STATE_COMPLETED") {
    if (job.state === "JOB_STATE_FAILED") {
      return {
        kind: "error",
        status: 0,
        message: `Bluesky could not process the video: ${job.message ?? job.error ?? "failed"}`,
      };
    }
    if (Date.now() > deadlineMs) {
      return {
        kind: "error",
        status: 0,
        message: "Bluesky took too long to process the video",
      };
    }
    await wait(POLL_MS);
    const statusUrl = new URL(
      "/xrpc/app.bsky.video.getJobStatus",
      VIDEO_SERVICE
    );
    statusUrl.searchParams.set("jobId", job.jobId);
    const status = await callBlueskyApi<{ jobStatus: JobStatus }>({
      url: statusUrl,
      method: "GET",
      accessJwt: options.session.accessJwt,
    });
    if (status.kind === "error") return status;
    job = status.data.jobStatus;
  }
  if (job.blob === undefined) {
    return {
      kind: "error",
      status: 0,
      message: "Bluesky returned no video blob",
    };
  }
  return { kind: "ok", data: job.blob };
}
