import "server-only";

import { createCcAuthClient } from "@/lib/cc/supabase/create-cc-auth-client";

import { isCcOwnerEmail } from "./is-cc-owner-email";

/** Return the signed-in Supabase user when they are the command center owner, or `undefined` otherwise. */
export async function getCcOwner() {
  const supabase = await createCcAuthClient();
  const { data } = await supabase.auth.getUser();
  if (data.user === null || !isCcOwnerEmail(data.user.email)) return undefined;
  return data.user;
}
