import { cookies } from "next/headers";

import { createServiceRoleClient } from "@/lib/supabase/create-service-role-client";

export async function fetchPostViews() {
  // Force revalidate the cache
  await cookies();

  const supabase = createServiceRoleClient();
  const response = await supabase.from("post_views").select();
  if (response.error) throw response.error;
  return response.data;
}
