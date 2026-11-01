"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Save `body` as the ChatGPT variant of `postId`: update the variant already in its `variant_group`, or create a draft copy with `variant = "chatgpt"` and give the original a `variant_group` when it has none; return the variant. */
export async function saveChatgptVariant(options: {
  postId: string;
  body: string;
}) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: original, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", options.postId)
    .eq("variant", "mine")
    .single();
  if (error) throw error;

  const now = new Date().toISOString();
  const variantGroup = original.variant_group ?? crypto.randomUUID();
  if (original.variant_group === null) {
    const { error: groupError } = await supabase
      .from("posts")
      .update({ variant_group: variantGroup, updated_at: now })
      .eq("id", original.id);
    if (groupError) throw groupError;
  }

  const { data: existing, error: existingError } = await supabase
    .from("posts")
    .select("id")
    .eq("variant_group", variantGroup)
    .eq("variant", "chatgpt")
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;

  const query =
    existing === null
      ? supabase.from("posts").insert({
          campaign_id: original.campaign_id,
          platform: original.platform,
          kind: original.kind,
          parent_post_id: original.parent_post_id,
          target: original.target,
          scheduled_at: original.scheduled_at,
          status: "draft",
          title: original.title,
          body: options.body,
          hashtags: original.hashtags,
          link: original.link,
          assets: original.assets,
          variant: "chatgpt",
          variant_group: variantGroup,
        })
      : supabase
          .from("posts")
          .update({ body: options.body, updated_at: now })
          .eq("id", existing.id);
  const { data: variant, error: saveError } = await query.select("*").single();
  if (saveError) throw saveError;

  revalidatePath("/cc", "layout");
  return variant;
}
