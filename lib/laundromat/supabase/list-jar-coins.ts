import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Return the number and date of every tip, oldest first; throws on a database error. */
export async function listJarCoins(options: {
  client: SupabaseClient<LaundromatDatabase>;
}) {
  const { data, error } = await options.client
    .from("tips")
    .select("number, created_at")
    .order("number");
  if (error) throw error;
  return data.map((row) => ({ number: row.number, createdAt: row.created_at }));
}
