import "server-only";

import { planPostReminders } from "@/lib/cc/plan-post-reminders";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Bring a post's unsent reminders in line with its schedule: delete them for drafts and skipped posts, otherwise upsert the planned ones without touching reminders already sent. */
export async function syncPostReminders(options: {
  postId: string;
  status: string;
  kind: string;
  scheduledAt: string | null;
  postedAt: string | null;
}) {
  const supabase = createCcServiceClient();
  const isTracked =
    options.kind === "post" &&
    options.scheduledAt !== null &&
    (options.status === "scheduled" || options.status === "posted");

  const { error: deleteError } = await supabase
    .from("reminders")
    .delete()
    .eq("post_id", options.postId)
    .is("sent_at", null)
    .in("kind", isTracked ? ["post"] : ["post", "reply", "log"]);
  if (deleteError) throw deleteError;
  if (!isTracked || options.scheduledAt === null) return;

  const planned = planPostReminders({
    scheduledAt: new Date(options.scheduledAt),
    postedAt:
      options.postedAt === null ? undefined : new Date(options.postedAt),
  });
  const { data: sent, error: sentError } = await supabase
    .from("reminders")
    .select("kind, checkpoint")
    .eq("post_id", options.postId)
    .not("sent_at", "is", null);
  if (sentError) throw sentError;

  const rows = planned
    .filter(
      (reminder) =>
        !sent.some(
          (row) =>
            row.kind === reminder.kind && row.checkpoint === reminder.checkpoint
        )
    )
    .map((reminder) => ({
      post_id: options.postId,
      kind: reminder.kind,
      checkpoint: reminder.checkpoint,
      fire_at: reminder.fireAt.toISOString(),
    }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("reminders")
    .upsert(rows, { onConflict: "post_id,kind,checkpoint" });
  if (error) throw error;
}
