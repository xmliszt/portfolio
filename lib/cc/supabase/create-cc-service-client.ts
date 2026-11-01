import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./__generated__/types";

/** Create a service-role Supabase client on the `command_center` schema, for server code that has already checked the owner. */
export function createCcServiceClient() {
  return createClient<Database, "command_center">(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: "command_center" },
    }
  );
}
