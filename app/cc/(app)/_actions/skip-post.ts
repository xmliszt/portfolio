"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { markPostSkipped } from "@/lib/cc/data/mark-post-skipped";

/** Mark an unposted post and its unposted replies and comments as skipped, drop their unsent reminders, and return the skipped post. */
export async function skipPost(options: { postId: string }) {
  await requireCcOwner();
  const post = await markPostSkipped(options);
  if (post === undefined) {
    throw new Error("The post is already posted or does not exist");
  }
  revalidatePath("/cc", "layout");
  return post;
}
