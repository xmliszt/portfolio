import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Create a service-role Supabase client on the `paws` schema, for API routes only. */
export function createPawsServiceClient() {
  return createClient(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: "paws" },
    }
  );
}
