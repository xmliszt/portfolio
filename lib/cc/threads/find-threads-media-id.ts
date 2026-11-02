import "server-only";

import { normaliseThreadsUrl } from "@/lib/cc/normalise-threads-url";

import { listMyThreads } from "./list-my-threads";

const LOOKUP_LIMIT = 50;

/** Return the media id of the account's recent thread at `permalink`, or `undefined` when it is not among the last 50. */
export async function findThreadsMediaId(options: {
  accessToken: string;
  permalink: string;
}) {
  const path = normaliseThreadsUrl(options.permalink);
  if (path === undefined) return undefined;
  const threads = await listMyThreads({
    accessToken: options.accessToken,
    limit: LOOKUP_LIMIT,
  });
  if (threads.kind === "error") return undefined;
  return threads.data.data.find(
    (thread) =>
      thread.permalink !== undefined &&
      normaliseThreadsUrl(thread.permalink) === path
  )?.id;
}
