import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

const REPLY_WINDOW_MS = 2 * 60 * 60_000;

/** Return reminders whose `fire_at` has passed and that are not done, oldest first, leaving out "reply" reminders that fired more than two hours ago. */
export async function listDueReminders(options: { now: Date }) {
  const replyWindowStart = new Date(
    options.now.getTime() - REPLY_WINDOW_MS
  ).toISOString();
  const { data, error } = await createCcServiceClient()
    .from("reminders")
    .select("*")
    .lte("fire_at", options.now.toISOString())
    .is("done_at", null)
    .or(`kind.neq.reply,fire_at.gte.${replyWindowStart}`)
    .order("fire_at", { ascending: true });
  if (error) throw error;
  return data;
}
