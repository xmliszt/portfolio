import "server-only";

import { createClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Return a service-role client for the notebook tables, or `undefined` when `SUPABASE_DB_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not set. */
export function createLaundromatServiceClient() {
  const url = process.env.SUPABASE_DB_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return undefined;
  return createClient<LaundromatDatabase>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
