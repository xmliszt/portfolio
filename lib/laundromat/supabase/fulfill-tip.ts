import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

const UNIQUE_VIOLATION = "23505";

type FulfillTipOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  sessionId: string;
  amountCents: number;
  tokenHash: string;
  email: string | undefined;
  uses: number;
};

/** Record the paid Checkout Session `sessionId` with the payer's `email` and its token's `uses` as the next coin in the jar through `fulfill_tip` and return it with its recorded `uses` as `recorded`, the same coin (with `email` filled in if it had none) when it is already recorded; `duplicate-hash` when another tip already holds `tokenHash`, and throw on any other database error. */
export async function fulfillTip(options: FulfillTipOptions) {
  const { data, error } = await options.client.rpc("fulfill_tip", {
    p_session_id: options.sessionId,
    p_amount_cents: options.amountCents,
    p_token_hash: options.tokenHash,
    p_email: options.email,
    p_uses: options.uses,
  });
  if (error?.code === UNIQUE_VIOLATION)
    return { kind: "duplicate-hash" } as const;
  if (error) throw error;
  return {
    kind: "recorded",
    coin: { number: data.number, createdAt: data.created_at },
    uses: data.uses,
  } as const;
}
