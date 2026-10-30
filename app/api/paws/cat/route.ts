import type { GetCatResponse, PutCatResponse } from "@/lib/paws/cat-api-types";
import { parseCatLook } from "@/lib/paws/parse-cat-look";
import { parseVoiceSettings } from "@/lib/paws/profile/parse-voice-settings";
import { readRequestUser } from "@/lib/paws/supabase/read-request-user";
import { readSavedCat } from "@/lib/paws/profile/read-saved-cat";
import { saveCat } from "@/lib/paws/profile/save-cat";
import { createPawsServiceClient } from "@/lib/paws/supabase/create-paws-service-client";

export const dynamic = "force-dynamic";

async function readMember(request: Request) {
  const client = createPawsServiceClient();
  const user = await readRequestUser({ request, client });
  return user === undefined || user.isAnonymous ? undefined : { client, userId: user.userId };
}

export async function GET(request: Request) {
  const member = await readMember(request);
  if (member === undefined) {
    return Response.json({ kind: "signInRequired" } satisfies GetCatResponse, { status: 401 });
  }
  const cat = await readSavedCat(member);
  return Response.json((cat === undefined ? { kind: "none" } : { kind: "found", cat }) satisfies GetCatResponse);
}

export async function PUT(request: Request) {
  const member = await readMember(request);
  if (member === undefined) {
    return Response.json({ kind: "signInRequired" } satisfies PutCatResponse, { status: 401 });
  }
  const body: unknown = await request.json().catch(() => undefined);
  const look = typeof body === "object" && body !== null && "look" in body ? parseCatLook(body.look) : undefined;
  const voice = typeof body === "object" && body !== null && "voice" in body ? parseVoiceSettings(body.voice) : undefined;
  if (look === undefined || voice === undefined) {
    return Response.json({ kind: "invalid" } satisfies PutCatResponse, { status: 400 });
  }
  const cat = await saveCat({ client: member.client, userId: member.userId, cat: { look, voice } });
  return Response.json({ kind: "saved", cat } satisfies PutCatResponse);
}
