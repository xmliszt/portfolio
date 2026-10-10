import { NextRequest, NextResponse } from "next/server";

import { resolveLaundromatRequest } from "@/lib/laundromat/resolve-laundromat-request";

export function proxy(request: NextRequest) {
  const resolution = resolveLaundromatRequest({
    hostname: request.headers.get("host")?.split(":", 1).at(0) ?? "",
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });
  switch (resolution.kind) {
    case "rewrite": {
      const url = request.nextUrl.clone();
      url.pathname = resolution.pathname;
      return NextResponse.rewrite(url);
    }
    case "redirect":
      return NextResponse.redirect(resolution.url);
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
      has: [{ type: "host", value: "laundromat\\.(liyuxuan\\.dev|localhost)" }],
    },
    {
      source: "/laundromat/:path*",
      has: [{ type: "host", value: "(www\\.)?liyuxuan\\.dev" }],
    },
  ],
};
