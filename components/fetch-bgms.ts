'use server';

import { getDownloadURL, ref } from 'firebase/storage';

import { firebaseStorage } from '@/lib/firebase';
import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

export type BGM = {
  title: string;
  artist: string;
  url: string;
  external_url: string;
};

export async function fetchBGMs() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from('bgms').select();
  if (response.error) throw response.error;
  const bgms = response.data;
  let result: BGM[] = [];
  for (const bgm of bgms) {
    const bgmRef = ref(firebaseStorage, `bgms/${bgm.id}.mp3`);
    const publicUrl = await getDownloadURL(bgmRef);
    result.push({
      title: bgm.title,
      artist: bgm.artist,
      url: publicUrl,
      external_url: bgm.external_url,
    });
  }
  return result;
}
