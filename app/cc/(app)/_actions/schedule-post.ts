"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { syncPostReminders } from "@/lib/cc/data/sync-post-reminders";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Move an unposted post to `scheduledAt` with status "scheduled", move its unposted replies and comments by the same amount, resync their reminders, and return the moved post. */
export async function schedulePost(options: {
  postId: string;
  scheduledAt: string;
}) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.postId)
    .single();
  if (error) throw error;
  if (post.status === "posted") {
    throw new Error("A posted post cannot be rescheduled");
  }

  const { data: children, error: childrenError } = await supabase
    .from("posts")
    .select("*")
    .eq("parent_post_id", post.id)
    .in("kind", ["reply", "comment"])
    .neq("status", "posted");
  if (childrenError) throw childrenError;

  const nextTime = new Date(options.scheduledAt);
  const shiftMs =
    post.scheduled_at === null
      ? 0
      : nextTime.getTime() - new Date(post.scheduled_at).getTime();
  const now = new Date().toISOString();
  async function move(options: { id: string; scheduledAt: string }) {
    const { data, error: updateError } = await supabase
      .from("posts")
      .update({
        scheduled_at: options.scheduledAt,
        status: "scheduled",
        updated_at: now,
      })
      .eq("id", options.id)
      .neq("status", "posted")
      .select("*")
      .single();
    if (updateError) throw updateError;
    await syncPostReminders({
      postId: data.id,
      status: data.status,
      kind: data.kind,
      scheduledAt: data.scheduled_at,
      postedAt: data.posted_at,
    });
    return data;
  }

  // Children move before the parent so a failed run can be retried with the same shift.
  await Promise.all(
    children.map((child) =>
      move({
        id: child.id,
        scheduledAt: new Date(
          child.scheduled_at === null
            ? nextTime.getTime()
            : new Date(child.scheduled_at).getTime() + shiftMs
        ).toISOString(),
      })
    )
  );
  const moved = await move({
    id: post.id,
    scheduledAt: nextTime.toISOString(),
  });
  revalidatePath("/cc", "layout");
  return moved;
}
