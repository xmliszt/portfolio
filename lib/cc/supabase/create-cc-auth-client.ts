import "server-only";

import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Create a Supabase auth client that reads and writes the sign-in session in the request cookies. */
export async function createCcAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.SUPABASE_DB_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) => {
          try {
            cookiesToSet.forEach((cookie) =>
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            );
          } catch {
            // Server components cannot set cookies; `proxy.ts` refreshes the session instead.
          }
        },
      },
    }
  );
}
