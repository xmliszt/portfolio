import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Return reminders whose `fire_at` has passed and that are not done, oldest first. */
export async function listDueReminders(options: { now: Date }) {
  const { data, error } = await createCcServiceClient()
    .from("reminders")
    .select("*")
    .lte("fire_at", options.now.toISOString())
    .is("done_at", null)
    .order("fire_at", { ascending: true });
  if (error) throw error;
  return data;
}
