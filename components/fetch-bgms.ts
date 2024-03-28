'use server';

import { getDownloadURL, ref } from 'firebase/storage';

import { firebaseStorage } from '@/lib/firebase';
import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

export type BGM = {
  id: string;
  title: string;
  artist: string;
  url: string;
  external_url: string;
};

export async function fetchBGMs() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from('bgms').select();
  if (response.error) throw response.error;
  return {
    bgms: response.data.map((bgm) => ({
      id: bgm.id,
      title: bgm.title,
      artist: bgm.artist,
      url: '',
      external_url: bgm.external_url,
    })),
  };
}

export async function fetchBGMPublicUrl(bgmId: string) {
  const bgmRef = ref(firebaseStorage, `bgms/${bgmId}.mp3`);
  return {
    publicUrl: await getDownloadURL(bgmRef),
  };
}
