import "server-only";

import Stripe from "stripe";

/** Return a Stripe client for `STRIPE_SECRET_KEY`, or `undefined` when it is not set. */
export function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return undefined;
  return new Stripe(secretKey);
}
