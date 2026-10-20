"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { createStripeClient } from "@/lib/laundromat/stripe/create-stripe-client";
import { fulfillCheckoutSession } from "@/lib/laundromat/stripe/fulfill-checkout-session";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { findTipByTokenHash } from "@/lib/laundromat/supabase/find-tip-by-token-hash";
import { listJarCoins } from "@/lib/laundromat/supabase/list-jar-coins";
import { spendTip } from "@/lib/laundromat/supabase/spend-tip";
import { hashTokenCode } from "@/lib/laundromat/tip/hash-token-code";
import { parseTokenCode } from "@/lib/laundromat/tip/parse-token-code";
import { CUSTOM_TIP_CENTS } from "@/lib/laundromat/tip/tip-amounts";
import type { JarCoin } from "@/lib/laundromat/tip/tip-token";
import { TOKEN_HASH_PATTERN } from "@/lib/laundromat/tip/token-hash-pattern";

const TIP_PRODUCT_NAME = "Tip for laundro.cafe";
const INTEGRATION_IDENTIFIER = "laundro-cafe-coin-machine-qwhmzbtk";
const SESSION_LIFETIME_S = 31 * 60;
const FAILED_PAYMENT_STATUSES = ["canceled", "requires_payment_method"];
const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{1,200}$/;

export type StartTipResult =
  | { kind: "started"; sessionId: string; clientSecret: string }
  | { kind: "invalid" }
  | { kind: "unavailable" };

export type TipStatus =
  | { kind: "paid"; coin: JarCoin }
  | { kind: "pending" }
  | { kind: "expired" }
  | { kind: "failed" }
  | { kind: "unavailable" };

export type RestoreResult =
  | { kind: "restored"; coin: JarCoin & { spentAt?: string } }
  | { kind: "unknown" }
  | { kind: "unavailable" };

async function getReturnUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "laundro.cafe";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.endsWith("localhost") || host.includes("localhost:")
      ? "http"
      : "https");
  return `${protocol}://${host}/?tip_session={CHECKOUT_SESSION_ID}`;
}

/** Open a Stripe Checkout Session for a tip of `cents` that carries `tokenHash`, and return its id and client secret; `invalid` when `cents` is out of range or `tokenHash` is not a SHA-256 hex digest, `unavailable` when Stripe is not configured. */
export async function startTip(options: {
  cents: number;
  tokenHash: string;
}): Promise<StartTipResult> {
  const { cents, tokenHash } = options;
  if (
    !Number.isInteger(cents) ||
    cents < CUSTOM_TIP_CENTS.min ||
    cents > CUSTOM_TIP_CENTS.max ||
    !TOKEN_HASH_PATTERN.test(tokenHash)
  ) {
    return { kind: "invalid" };
  }
  const stripe = createStripeClient();
  if (stripe === undefined) return { kind: "unavailable" };
  const session = await stripe.checkout.sessions.create({
    ui_mode: "elements",
    mode: "payment",
    managed_payments: { enabled: false },
    line_items: [
      {
        price_data: {
          currency: "sgd",
          unit_amount: cents,
          product_data: { name: TIP_PRODUCT_NAME },
        },
        quantity: 1,
      },
    ],
    metadata: { token_hash: tokenHash },
    payment_intent_data: { description: TIP_PRODUCT_NAME },
    return_url: await getReturnUrl(),
    expires_at: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_S,
    integration_identifier: INTEGRATION_IDENTIFIER,
  });
  if (session.client_secret === null) return { kind: "unavailable" };
  return {
    kind: "started",
    sessionId: session.id,
    clientSecret: session.client_secret,
  };
}

/** Return whether the tip in Checkout Session `sessionId` is paid, recording its coin in the jar the first time it is, still pending, failed, expired (also when Stripe has no such session), or `unavailable` when Stripe or the database is not configured. */
export async function getTipStatus(options: {
  sessionId: string;
}): Promise<TipStatus> {
  if (!SESSION_ID_PATTERN.test(options.sessionId)) return { kind: "expired" };
  const stripe = createStripeClient();
  const client = createLaundromatServiceClient();
  if (stripe === undefined || client === undefined) {
    return { kind: "unavailable" };
  }
  const session = await stripe.checkout.sessions
    .retrieve(options.sessionId, { expand: ["payment_intent"] })
    .catch((error: unknown) => {
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === "resource_missing"
      ) {
        return undefined;
      }
      throw error;
    });
  if (session === undefined || session.status === "expired") {
    return { kind: "expired" };
  }
  const fulfilled = await fulfillCheckoutSession({ client, session });
  if (fulfilled?.kind === "recorded") {
    return { kind: "paid", coin: fulfilled.coin };
  }
  if (fulfilled?.kind === "duplicate-hash") return { kind: "failed" };
  const paymentIntent = session.payment_intent;
  const isFailed =
    session.status === "complete" &&
    typeof paymentIntent === "object" &&
    paymentIntent !== null &&
    FAILED_PAYMENT_STATUSES.includes(paymentIntent.status);
  return isFailed ? { kind: "failed" } : { kind: "pending" };
}

/** Return the coin of the tip whose token code is `code`, read leniently as typed by hand, or `unknown` when no tip has it. */
export async function restoreToken(options: {
  code: string;
}): Promise<RestoreResult> {
  const code = parseTokenCode(options.code);
  if (code === undefined) return { kind: "unknown" };
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "unavailable" };
  const coin = await findTipByTokenHash({
    client,
    tokenHash: await hashTokenCode(code),
  });
  return coin === undefined ? { kind: "unknown" } : { kind: "restored", coin };
}

export type SpendResult =
  | { kind: "spent"; spentAt: string }
  | { kind: "already-spent"; spentAt: string }
  | { kind: "unknown" }
  | { kind: "unavailable" };

/** Spend the token whose code is `code`, read leniently, so it cannot be used again on any device; `already-spent` when it was, `unknown` when no tip has it. */
export async function spendToken(options: {
  code: string;
}): Promise<SpendResult> {
  const code = parseTokenCode(options.code);
  if (code === undefined) return { kind: "unknown" };
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "unavailable" };
  return spendTip({ client, tokenHash: await hashTokenCode(code) });
}

/** Return every coin in the tip jar, oldest first, or `undefined` when the database is not configured. */
export async function loadJar(): Promise<JarCoin[] | undefined> {
  const client = createLaundromatServiceClient();
  if (client === undefined) return undefined;
  return listJarCoins({ client });
}
