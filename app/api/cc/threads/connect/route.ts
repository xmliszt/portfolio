import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { getCcOwner } from "@/lib/cc/auth/get-cc-owner";
import { buildThreadsAuthorizeUrl } from "@/lib/cc/threads/build-threads-authorize-url";
import { getThreadsApp } from "@/lib/cc/threads/get-threads-app";
import { THREADS_STATE_COOKIE } from "@/lib/cc/threads/threads-api";

export async function GET() {
  if ((await getCcOwner()) === undefined) {
    return new Response("Unauthorized", { status: 401 });
  }
  const app = getThreadsApp();
  if (app === undefined) {
    return new Response("Threads is not set up", { status: 404 });
  }
  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(
    buildThreadsAuthorizeUrl({ appId: app.appId, state })
  );
  response.cookies.set(THREADS_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/cc/threads",
    maxAge: 600,
  });
  return response;
}
