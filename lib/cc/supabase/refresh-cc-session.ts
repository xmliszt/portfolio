import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** Return a rewrite of `request` to `url` that carries refreshed sign-in session cookies both to the page and back to the browser. */
export async function refreshCcSession(options: {
  request: NextRequest;
  url: URL;
}) {
  let response = NextResponse.rewrite(options.url, {
    request: { headers: options.request.headers },
  });
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
          cookiesToSet.forEach((cookie) =>
            options.request.cookies.set(cookie.name, cookie.value)
          );
          response = NextResponse.rewrite(options.url, {
            request: { headers: options.request.headers },
          });
          cookiesToSet.forEach((cookie) =>
            response.cookies.set(cookie.name, cookie.value, cookie.options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
  return response;
}
