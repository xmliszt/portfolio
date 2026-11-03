import "server-only";

import { cache } from "react";

import { getIntegration } from "@/lib/cc/data/get-integration";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getThreadsApp } from "@/lib/cc/threads/get-threads-app";

export type ThreadsStatus =
  | { kind: "not-set-up" }
  | { kind: "not-connected" }
  | { kind: "expired"; username: string | undefined }
  | {
      kind: "connected";
      username: string | undefined;
      expiresLabel: string | undefined;
    };

/** Return whether Threads is set up, connected, or connected with a token past `expires_at`, with the account's username and token expiry in SGT. */
export const getThreadsStatus = cache(async (): Promise<ThreadsStatus> => {
  if (getThreadsApp() === undefined) return { kind: "not-set-up" };
  const integration = await getIntegration({ provider: "threads" });
  if (integration === undefined) return { kind: "not-connected" };
  if (
    integration.expires_at !== null &&
    new Date(integration.expires_at) <= new Date()
  ) {
    return { kind: "expired", username: integration.username ?? undefined };
  }
  return {
    kind: "connected",
    username: integration.username ?? undefined,
    expiresLabel:
      integration.expires_at === null
        ? undefined
        : formatSgt({
            date: new Date(integration.expires_at),
            pattern: "EEE dd MMM HH:mm",
          }),
  };
});
