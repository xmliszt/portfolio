"use server";

import { getDownloadURL, ref } from "firebase/storage";

import { firebaseStorage } from "@/lib/firebase";
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
        public_url: await fetchBGMPublicUrl(bgm.id),
        external_url: bgm.external_url,
      }))
    ),
  };
}

async function fetchBGMPublicUrl(bgmId: string) {
  const bgmRef = ref(firebaseStorage, `bgms/${bgmId}.mp3`);
  return await getDownloadURL(bgmRef);
}
