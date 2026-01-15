"use server";

import { createServiceRoleClient } from "@/lib/supabase/create-service-role-client";

export async function fetchBGMs() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from("bgms").select();
  if (response.error) throw response.error;
  return {
    bgms: await Promise.all(
      response.data.map(async (bgm) => ({
        id: bgm.id,
        title: bgm.title,
        artist: bgm.artist,
        public_url: getBgmPublicUrl(bgm.id),
        external_url: bgm.external_url,
      }))
    ),
  };
}

function getBgmPublicUrl(bgmId: string) {
  const SUPABASE_URL = process.env.SUPABASE_DB_URL!;
  return `${SUPABASE_URL}/storage/v1/object/public/bgm/${bgmId}.mp3`;
}
