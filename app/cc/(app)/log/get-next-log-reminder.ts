import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return the earliest open "log" reminder among `postIds` whose `fire_at` is after `now`, or `undefined` when there is none. */
export async function getNextLogReminder(options: {
  now: Date;
  postIds: string[];
}) {
  if (options.postIds.length === 0) return undefined;
  const { data, error } = await createCcServiceClient()
    .from("reminders")
    .select("*")
    .eq("kind", "log")
    .in("post_id", options.postIds)
    .gt("fire_at", options.now.toISOString())
    .is("done_at", null)
    .order("fire_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}
