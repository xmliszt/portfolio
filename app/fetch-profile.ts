import 'server-only';

import { createServiceRoleClient } from '@/supabase/create-server-client';

export async function fetchProfile() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from('profiles').select().single();
  if (response.error) throw response.error;
  return response.data;
}
