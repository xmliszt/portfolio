import type { NextRequest } from "next/server";

import { getVersionBody } from "@/lib/laundromat/get-version-body";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return Response.json(
    getVersionBody({
      buildId: process.env.LAUNDROMAT_BUILD_ID,
      localeTag: request.nextUrl.searchParams.get("locale") ?? undefined,
    }),
    { headers: { "Cache-Control": "no-store" } }
  );
}
