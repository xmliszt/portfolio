import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Mark the tip whose token hash is `tokenHash` as spent now, in one update that only touches an unspent tip, and return `spent` with the time, `already-spent` with the earlier time, or `unknown` when no tip has the hash; throws on a database error. */
export async function spendTip(options: {
  client: SupabaseClient<LaundromatDatabase>;
  tokenHash: string;
}) {
  const { data: spent, error } = await options.client
    .from("tips")
    .update({ spent_at: new Date().toISOString() })
    .eq("token_hash", options.tokenHash)
    .is("spent_at", null)
    .select("spent_at")
    .maybeSingle();
  if (error) throw error;
  if (spent?.spent_at) {
    return { kind: "spent", spentAt: spent.spent_at } as const;
  }
  const { data: existing, error: readError } = await options.client
    .from("tips")
    .select("spent_at")
    .eq("token_hash", options.tokenHash)
    .maybeSingle();
  if (readError) throw readError;
  return existing?.spent_at
    ? ({ kind: "already-spent", spentAt: existing.spent_at } as const)
    : ({ kind: "unknown" } as const);
}
