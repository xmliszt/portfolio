"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import type { RepostPublishMode } from "@/lib/cc/repost-publish-modes";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Set how an unposted repost goes out (`repost_as`), turning auto-post off so the new mode is checked again before it posts. */
export async function setRepostMode(options: {
  postId: string;
  mode: RepostPublishMode;
}) {
  await requireCcOwner();
  const { error } = await createCcServiceClient()
    .from("posts")
    .update({
      repost_as: options.mode,
      auto_publish: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", options.postId)
    .eq("kind", "repost")
    .in("status", ["draft", "scheduled"])
    .is("publish_claimed_at", null);
  if (error) throw error;
  revalidatePath("/cc", "layout");
}
