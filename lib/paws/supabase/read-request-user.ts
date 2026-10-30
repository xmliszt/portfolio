import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type RequestUser = { userId: string; isAnonymous: boolean };

/** Return the Supabase user behind the request's `Authorization: Bearer` access token, or `undefined` when there is no valid token. */
export async function readRequestUser(options: {
  request: Request;
  client: { auth: SupabaseClient["auth"] };
}): Promise<RequestUser | undefined> {
  const token = options.request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.at(1);
  if (token === undefined) return undefined;
  const { data, error } = await options.client.auth.getUser(token);
  if (error || data.user === null) return undefined;
  return { userId: data.user.id, isAnonymous: data.user.is_anonymous ?? false };
}
