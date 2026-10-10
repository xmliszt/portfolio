import "server-only";

import { createClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

export function createLaundromatServiceClient() {
  return createClient<LaundromatDatabase>(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
