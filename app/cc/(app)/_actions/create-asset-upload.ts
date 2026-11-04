"use server";

import { randomUUID } from "node:crypto";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { CC_ASSETS_BUCKET } from "@/lib/cc/post-asset";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

/** Reserve an object path for `fileName` under the folder of `postId`'s campaign (`custom` for a custom post) and return it with a one-time token the browser uploads the file with. */
export async function createAssetUpload(options: {
  postId: string;
  fileName: string;
}) {
  await requireCcOwner();
  const supabase = createCcServiceClient();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("campaign_id")
    .eq("id", options.postId)
    .single();
  if (postError) throw postError;
  const safeName = options.fileName.replace(/[^\w.\-]+/g, "-");
  const path = `${post.campaign_id ?? "custom"}/uploads/${randomUUID()}/${safeName}`;
  const { data, error } = await supabase.storage
    .from(CC_ASSETS_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return {
    path: data.path,
    token: data.token,
    supabaseUrl: process.env.SUPABASE_DB_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
