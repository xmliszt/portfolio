import { type CookieOptions, createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/** Refresh the sign-in session cookies on `response`, leaving the response unchanged when there is no session. */
export async function refreshCcSession(options: {
  request: NextRequest;
  response: NextResponse;
}) {
  const supabase = createServerClient(
    process.env.SUPABASE_DB_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => options.request.cookies.getAll(),
        setAll: (
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) => {
          cookiesToSet.forEach((cookie) => {
            options.request.cookies.set(cookie.name, cookie.value);
            options.response.cookies.set(
              cookie.name,
              cookie.value,
              cookie.options
            );
          });
        },
      },
    }
  );
  await supabase.auth.getUser();
  return options.response;
}
