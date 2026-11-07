import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import type { PostRow } from "./cc-rows";

const PAGE_SIZE = 1000;

/** Return every post in every campaign and every custom post, only those of `variant` when it is set, ordered by `scheduled_at` with unscheduled drafts last, reading page by page past the API's row limit. */
export async function listAllPosts(options: { variant?: "mine" | "chatgpt" }) {
  const supabase = createCcServiceClient();
  async function readFrom(offset: number): Promise<PostRow[]> {
    const query = supabase.from("posts").select("*");
    const { data, error } = await (
      options.variant === undefined
        ? query
        : query.eq("variant", options.variant)
    )
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    return data.length < PAGE_SIZE
      ? data
      : [...data, ...(await readFrom(offset + PAGE_SIZE))];
  }
  return readFrom(0);
}
