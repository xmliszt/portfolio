import type { MeowResponse } from "@/lib/paws/meow-api-types";
import { createMeowDependencies } from "@/lib/paws/profile/create-meow-dependencies";
import { createMeowPipeline } from "@/lib/paws/profile/create-meow-pipeline";
import type { MeowPipelineResult } from "@/lib/paws/profile/meow-pipeline-types";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";
import { readRequestIp } from "@/lib/paws/profile/read-request-ip";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function toResponse(result: MeowPipelineResult) {
  switch (result.kind) {
    case "catNotSaved":
      return new Response(undefined, { status: 409 });
    case "invalid":
      return new Response(undefined, { status: 400 });
    case "signInRequired":
      return Response.json(result satisfies MeowResponse, { status: 401 });
    case "tooManyAttempts":
      return Response.json(result satisfies MeowResponse, { status: 429 });
    case "generated":
    case "reused":
    case "borrowed":
    case "refusedByUs":
    case "refusedByProvider":
    case "failed":
    case "alreadyHasMeow":
      return Response.json(result satisfies MeowResponse);
    default: {
      const unknownResult: never = result;
      throw new Error(`Unknown meow result ${String(unknownResult)}`);
    }
  }
}

export async function POST(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  const body: unknown = await request.json().catch(() => undefined);
  const pipeline = createMeowPipeline(createMeowDependencies(client));
  return toResponse(await pipeline.requestMeow({ user, ip: readRequestIp(request.headers), body }));
}
