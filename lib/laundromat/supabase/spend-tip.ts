import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Spend the tip whose token hash is `tokenHash` through `spend_tip`, which only spends an unspent tip and treats a repeat of the same `attempt` as the same spend; returns `spent` or `already-spent` with the spend time, or `unknown`, and throws on a database error. */
export async function spendTip(options: {
  client: SupabaseClient<LaundromatDatabase>;
  tokenHash: string;
  attempt: string;
}) {
  const { data, error } = await options.client.rpc("spend_tip", {
    p_token_hash: options.tokenHash,
    p_attempt: options.attempt,
  });
  if (error) throw error;
  const row = data.at(0);
  if (
    row?.spent_at &&
    (row.outcome === "spent" || row.outcome === "already-spent")
  ) {
    return { kind: row.outcome, spentAt: row.spent_at } as const;
  }
  return { kind: "unknown" } as const;
}
