import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Spend the tip whose token hash is `tokenHash` into `machineId` through `spend_tip`, which only spends a tip with uses left and treats a repeat of the same `attempt` as the same spend; returns `spent` with the spend time and the uses the token has left, `already-spent` with its last spend time when none are left, or `unknown`, and throws on a database error. */
export async function spendTip(options: {
  client: SupabaseClient<LaundromatDatabase>;
  tokenHash: string;
  attempt: string;
  machineId: string;
}) {
  const { data, error } = await options.client.rpc("spend_tip", {
    p_token_hash: options.tokenHash,
    p_attempt: options.attempt,
    p_machine_id: options.machineId,
  });
  if (error) throw error;
  const row = data.at(0);
  if (row?.spent_at && row.outcome === "spent" && row.uses_left !== null) {
    return {
      kind: "spent",
      spentAt: row.spent_at,
      usesLeft: row.uses_left,
    } as const;
  }
  if (row?.spent_at && row.outcome === "already-spent") {
    return { kind: "already-spent", spentAt: row.spent_at } as const;
  }
  return { kind: "unknown" } as const;
}
