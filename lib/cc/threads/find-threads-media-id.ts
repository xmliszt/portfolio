import "server-only";

import { normaliseThreadsUrl } from "@/lib/cc/normalise-threads-url";

import { listMyThreads } from "./list-my-threads";

const LOOKUP_LIMIT = 50;

/** Return the media id of the account's recent thread at `permalink`, or why it was not found among the last 50. */
export async function findThreadsMediaId(options: {
  accessToken: string;
  permalink: string;
}): Promise<{ kind: "ok"; id: string } | { kind: "error"; message: string }> {
  const path = normaliseThreadsUrl(options.permalink);
  if (path === undefined) {
    return {
      kind: "error",
      message: "The parent's link is not a Threads link.",
    };
  }
  const threads = await listMyThreads({
    accessToken: options.accessToken,
    limit: LOOKUP_LIMIT,
  });
  if (threads.kind === "error") {
    return {
      kind: "error",
      message: `Threads did not list your threads: ${threads.message}`,
    };
  }
  const id = threads.data.data.find(
    (thread) =>
      thread.permalink !== undefined &&
      normaliseThreadsUrl(thread.permalink) === path
  )?.id;
  return id === undefined
    ? {
        kind: "error",
        message:
          "CC could not find the Threads post to reply to among your last 50 threads.",
      }
    : { kind: "ok", id };
}
