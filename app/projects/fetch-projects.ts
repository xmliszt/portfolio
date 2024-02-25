import 'server-only';

import { createServiceRoleClient } from '@/supabase/create-server-client';

export async function fetchProjects() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from('projects').select();
  if (response.error) throw response.error;
  return response.data;
}
