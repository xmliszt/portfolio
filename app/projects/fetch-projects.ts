import 'server-only';

import { createServiceRoleClient } from '@/lib/supabase/create-service-role-client';

export async function fetchProjects() {
  const supabase = createServiceRoleClient();
  const response = await supabase.from('projects').select();
  if (response.error) throw response.error;
  return response.data;
}
