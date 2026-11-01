import { type NextRequest, NextResponse } from "next/server";

import { getCcOwner } from "@/lib/cc/auth/get-cc-owner";
import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { exchangeThreadsCode } from "@/lib/cc/threads/exchange-threads-code";
import { getThreadsApp } from "@/lib/cc/threads/get-threads-app";
import { THREADS_STATE_COOKIE } from "@/lib/cc/threads/threads-api";

export async function GET(request: NextRequest) {
  if ((await getCcOwner()) === undefined) {
    return new Response("Unauthorized", { status: 401 });
  }
  const app = getThreadsApp();
  if (app === undefined) {
    return new Response("Threads is not set up", { status: 404 });
  }
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const expectedState = request.cookies.get(THREADS_STATE_COOKIE)?.value;
  if (
    state === null ||
    expectedState === undefined ||
    state !== expectedState
  ) {
    return new Response("The sign-in link expired. Connect Threads again.", {
      status: 400,
    });
  }
  const code = params.get("code");
  if (code === null) {
    return new Response(
      `Threads did not connect: ${params.get("error_description") ?? params.get("error") ?? "no code"}`,
      { status: 400 }
    );
  }

  const now = new Date();
  const exchanged = await exchangeThreadsCode({
    appId: app.appId,
    appSecret: app.appSecret,
    code,
    now,
  });
  if (exchanged.kind === "error") {
    return new Response(`Threads did not connect: ${exchanged.message}`, {
      status: 502,
    });
  }
  const { error } = await createCcServiceClient()
    .from("integrations")
    .upsert({
      provider: "threads",
      access_token: exchanged.data.accessToken,
      user_id: exchanged.data.userId,
      username: exchanged.data.username ?? null,
      expires_at: exchanged.data.expiresAt.toISOString(),
      updated_at: now.toISOString(),
    });
  if (error) throw error;

  const response = NextResponse.redirect(`${CC_ORIGIN}/`);
  response.cookies.delete({
    name: THREADS_STATE_COOKIE,
    path: "/api/cc/threads",
  });
  return response;
}
