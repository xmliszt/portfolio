"use server";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { getIntegration } from "@/lib/cc/data/get-integration";
import { getThreadsApp } from "@/lib/cc/threads/get-threads-app";
import { searchThreadsKeyword } from "@/lib/cc/threads/search-threads-keyword";

const SEARCH_LIMIT = 25;
const MAX_TERMS = 10;

type TagCheck =
  | { kind: "not-set-up" }
  | { kind: "not-connected" }
  | { kind: "blocked"; reason: "token" | "permission" | "rate-limit" }
  | {
      kind: "checked";
      results: (
        | { kind: "failed"; term: string }
        | {
            kind: "found";
            term: string;
            count: number;
            isCapped: boolean;
            newestAt: string | undefined;
          }
      )[];
    };

/** Run a recent Threads search for each of `terms` (a leading `#` searches it as a tag) and return how many posts came back and the newest one's time, or why the search could not run. */
export async function checkThreadsTags(options: {
  terms: string[];
}): Promise<TagCheck> {
  await requireCcOwner();
  if (getThreadsApp() === undefined) return { kind: "not-set-up" };
  const integration = await getIntegration({ provider: "threads" });
  if (integration === undefined) return { kind: "not-connected" };

  const terms = [
    ...new Set(
      options.terms.map((term) => term.trim()).filter((term) => term !== "")
    ),
  ].slice(0, MAX_TERMS);
  const searches = await Promise.all(
    terms.map(async (term) => ({
      term,
      result: await searchThreadsKeyword({
        accessToken: integration.access_token,
        q: term.replace(/^#+/, ""),
        mode: term.startsWith("#") ? "TAG" : "KEYWORD",
        limit: SEARCH_LIMIT,
      }),
    }))
  );
  const blocking = searches.flatMap((search) =>
    search.result.kind === "error" && search.result.reason !== "other"
      ? [search.result.reason]
      : []
  );
  const reason = blocking.at(0);
  if (reason !== undefined) return { kind: "blocked", reason };

  return {
    kind: "checked",
    results: searches.map((search) => {
      if (search.result.kind === "error") {
        return { kind: "failed", term: search.term };
      }
      const timestamps = search.result.data.data.flatMap((thread) =>
        thread.timestamp === undefined
          ? []
          : [new Date(thread.timestamp.replace(/([+-]\d\d)(\d\d)$/, "$1:$2"))]
      );
      const newest = timestamps.toSorted((a, b) => b.getTime() - a.getTime());
      return {
        kind: "found",
        term: search.term,
        count: search.result.data.data.length,
        isCapped: search.result.data.data.length >= SEARCH_LIMIT,
        newestAt: newest.at(0)?.toISOString(),
      };
    }),
  };
}
