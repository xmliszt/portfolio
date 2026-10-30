import { reportMeow } from "@/lib/paws/profile/report-meow";
import type { ReportMeowResponse } from "@/lib/paws/profile/report-meow-api-types";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  if (user === undefined || user.isAnonymous) {
    return Response.json(
      { kind: "signInRequired" } satisfies ReportMeowResponse,
      { status: 401 }
    );
  }
  const body: unknown = await request.json().catch(() => undefined);
  const catUserId =
    typeof body === "object" &&
    body !== null &&
    "userId" in body &&
    typeof body.userId === "string"
      ? body.userId
      : undefined;
  if (catUserId === undefined || !UUID_PATTERN.test(catUserId)) {
    return Response.json({ kind: "invalid" } satisfies ReportMeowResponse, {
      status: 400,
    });
  }
  return Response.json(
    await reportMeow({ client, reporterId: user.userId, catUserId })
  );
}
