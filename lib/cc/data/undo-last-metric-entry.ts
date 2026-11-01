import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Delete the most recently captured metric row and reopen its log reminder; return the deleted row, or `undefined` when there is none. */
export async function undoLastMetricEntry() {
  const supabase = createCcServiceClient();
  const { data: last, error } = await supabase
    .from("post_metrics")
    .select("*")
    .order("captured_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (last === null) return undefined;

  const { error: deleteError } = await supabase
    .from("post_metrics")
    .delete()
    .eq("id", last.id);
  if (deleteError) throw deleteError;
  const { error: reminderError } = await supabase
    .from("reminders")
    .update({ done_at: null })
    .eq("post_id", last.post_id)
    .eq("kind", "log")
    .eq("checkpoint", last.checkpoint);
  if (reminderError) throw reminderError;
  return last;
}
