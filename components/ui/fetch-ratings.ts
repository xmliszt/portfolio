"use server";

import { createServiceRoleClient } from "@/lib/supabase/create-service-role-client";

type FetchRatingsOptions = {
  id: string;
};

export async function fetchRatings(options: FetchRatingsOptions) {
  const supabase = createServiceRoleClient();
  const fetchResponse = await supabase
    .from("ratings")
    .select()
    .eq("id", options.id)
    .maybeSingle();
  if (fetchResponse.error) throw fetchResponse.error;
  if (!fetchResponse.data) return { positive_rating: 0, negative_rating: 0 };
  return fetchResponse.data;
}
