import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Return the coin whose token hash is `tokenHash`, with when it was spent if it was, or `undefined` when no tip has it; throws on a database error. */
export async function findTipByTokenHash(options: {
  client: SupabaseClient<LaundromatDatabase>;
  tokenHash: string;
}) {
  const { data, error } = await options.client
    .from("tips")
    .select("number, created_at, spent_at")
    .eq("token_hash", options.tokenHash)
    .maybeSingle();
  if (error) throw error;
  return data === null
    ? undefined
    : {
        number: data.number,
        createdAt: data.created_at,
        spentAt: data.spent_at ?? undefined,
      };
}
