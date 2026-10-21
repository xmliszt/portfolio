import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { fulfillTip } from "@/lib/laundromat/supabase/fulfill-tip";
import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";
import { getFulfillableTip } from "@/lib/laundromat/tip/get-fulfillable-tip";
import { getTipUses } from "@/lib/laundromat/tip/get-tip-uses";

/** Record `session` as a coin in the jar, its token good for `getTipUses` of its amount, when `getFulfillableTip` accepts it and return `fulfillTip`'s result; return `undefined` without writing for any other session. */
export async function fulfillCheckoutSession(options: {
  client: SupabaseClient<LaundromatDatabase>;
  session: Stripe.Checkout.Session;
}) {
  const tip = getFulfillableTip(options.session);
  if (tip === undefined) return undefined;
  return fulfillTip({
    client: options.client,
    ...tip,
    uses: getTipUses(tip.amountCents),
  });
}
