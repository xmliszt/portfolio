import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isCcOwnerEmail } from "@/lib/cc/auth/is-cc-owner-email";

const LOGIN_PATHNAME = "/cc/login";

type SessionCookie = { name: string; value: string; options: CookieOptions };

/** Refresh the sign-in session cookies and return a rewrite of `request` to `url`, or a redirect to the login page for anyone but the owner and to the overview for an owner opening the login page; every response carries the refreshed cookies. */
export async function respondWithCcSession(options: {
  request: NextRequest;
  url: URL;
}) {
  const refreshed: SessionCookie[] = [];
  const supabase = createServerClient(
    process.env.SUPABASE_DB_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => options.request.cookies.getAll(),
        setAll: (cookiesToSet: SessionCookie[]) => {
          cookiesToSet.forEach((cookie) => {
            options.request.cookies.set(cookie.name, cookie.value);
            refreshed.push(cookie);
          });
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  const isOwner = isCcOwnerEmail(data.user?.email);
  const isLoginPage = options.url.pathname === LOGIN_PATHNAME;

  const response = (() => {
    if (!isOwner && !isLoginPage) {
      return NextResponse.redirect(new URL("/login", options.request.url));
    }
    if (isOwner && isLoginPage && options.request.method === "GET") {
      return NextResponse.redirect(new URL("/", options.request.url));
    }
    return NextResponse.rewrite(options.url, {
      request: { headers: options.request.headers },
    });
  })();
  refreshed.forEach((cookie) =>
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  );
  return response;
}
