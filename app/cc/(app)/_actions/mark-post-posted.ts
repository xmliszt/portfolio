"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { markPostLive } from "@/lib/cc/data/mark-post-live";

/** Mark a post as posted now with its live `url` (a post already posted keeps its `posted_at` and `url`), close its "post" reminder, and move its reply and log reminders to count from its `posted_at`. */
export async function markPostPosted(options: {
  postId: string;
  url: string | undefined;
}) {
  await requireCcOwner();
  const post = await markPostLive({
    postId: options.postId,
    url: options.url,
    platformPostId: undefined,
  });
  revalidatePath("/cc", "layout");
  return post;
}
