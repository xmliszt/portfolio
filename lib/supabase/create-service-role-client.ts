import 'server-only';

import { Database } from './__generated__/types';
import { createClient } from '@supabase/supabase-js';

/**
 * Create a supabase client with service role.
 */
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
