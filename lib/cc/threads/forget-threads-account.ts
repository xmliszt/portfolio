import "server-only";

import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";

import { getThreadsApp } from "./get-threads-app";
import { parseSignedRequest } from "./parse-signed-request";

/** Verify a Meta `signed_request` from a form POST and delete the stored Threads connection for its user; return that user's id, or `undefined` when the request is not genuine. */
export async function forgetThreadsAccount(request: Request) {
  const app = getThreadsApp();
  if (app === undefined) return undefined;
  const form = await request.formData();
  const payload = parseSignedRequest({
    signedRequest: String(form.get("signed_request") ?? ""),
    appSecret: app.appSecret,
  });
  const userId =
    payload !== undefined && "user_id" in payload
      ? String(payload.user_id)
      : undefined;
  if (userId === undefined) return undefined;
  const { error } = await createCcServiceClient()
    .from("integrations")
    .delete()
    .eq("provider", "threads")
    .eq("user_id", userId);
  if (error) throw error;
  return userId;
}
