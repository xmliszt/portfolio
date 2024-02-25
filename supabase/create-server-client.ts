import 'server-only';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './__generated__/types';

/**
 * Create a supabase client with service role.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.SUPABASE_DB_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );
}
