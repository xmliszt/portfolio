import { NextRequest, NextResponse } from "next/server";

import { LAUNDROMAT_LOCALE_COOKIE } from "@/lib/laundromat/i18n/laundromat-locales";
import { resolveLaundromatLocale } from "@/lib/laundromat/i18n/resolve-laundromat-locale";
import { resolveLaundromatRequest } from "@/lib/laundromat/resolve-laundromat-request";

export function proxy(request: NextRequest) {
  const resolution = resolveLaundromatRequest({
    hostname: request.headers.get("host")?.split(":", 1).at(0) ?? "",
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    locale: resolveLaundromatLocale({
      cookieLocale: request.cookies.get(LAUNDROMAT_LOCALE_COOKIE)?.value,
      acceptLanguage: request.headers.get("accept-language") ?? undefined,
    }),
  });
  switch (resolution.kind) {
    case "rewrite": {
      const url = request.nextUrl.clone();
      url.pathname = resolution.pathname;
      return NextResponse.rewrite(url);
    }
    case "redirect":
      return NextResponse.redirect(resolution.url, 308);
    case "pass":
      return NextResponse.next();
    default: {
      const unhandled: never = resolution;
      return unhandled;
    }
  }
}

export const config = {
  matcher: [
    {
      source: "/((?!api/|_next/|.*\\..*).*)",
      has: [
        {
          type: "host",
          value:
            "((www\\.)?laundro\\.cafe|laundromat\\.(liyuxuan\\.dev|localhost))",
        },
      ],
    },
    {
      source: "/(robots\\.txt|sitemap\\.xml|favicon\\.ico)",
      has: [
        {
          type: "host",
          value:
            "((www\\.)?laundro\\.cafe|laundromat\\.(liyuxuan\\.dev|localhost))",
        },
      ],
    },
    {
      source: "/laundromat/:path*",
      has: [{ type: "host", value: "(www\\.)?liyuxuan\\.dev" }],
    },
  ],
};
