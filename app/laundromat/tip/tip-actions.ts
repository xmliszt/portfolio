"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { getLaundromatCopy } from "@/lib/laundromat/i18n/get-laundromat-copy";
import { DEFAULT_LAUNDROMAT_LOCALE } from "@/lib/laundromat/i18n/laundromat-locales";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";
import { createStripeClient } from "@/lib/laundromat/stripe/create-stripe-client";
import { fulfillCheckoutSession } from "@/lib/laundromat/stripe/fulfill-checkout-session";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { findTipByTokenHash } from "@/lib/laundromat/supabase/find-tip-by-token-hash";
import { listGoldenSpends } from "@/lib/laundromat/supabase/list-golden-spends";
import { listJarCoins } from "@/lib/laundromat/supabase/list-jar-coins";
import { spendTip } from "@/lib/laundromat/supabase/spend-tip";
import { ATTEMPT_PATTERN } from "@/lib/laundromat/tip/attempt-pattern";
import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";
import { hashTokenCode } from "@/lib/laundromat/tip/hash-token-code";
import { isChargeableMachineId } from "@/lib/laundromat/tip/is-chargeable-machine-id";
import { MAX_CHECKED_ATTEMPTS } from "@/lib/laundromat/tip/max-checked-attempts";
import { parseTokenCode } from "@/lib/laundromat/tip/parse-token-code";
import { CUSTOM_TIP_CENTS } from "@/lib/laundromat/tip/tip-amounts";
import type {
  GoldenSpend,
  JarCoin,
  SpendResult,
} from "@/lib/laundromat/tip/tip-token";
import { TOKEN_CODE_HASH_PREFIX } from "@/lib/laundromat/tip/token-code-format";

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
  | { kind: "paid"; coin: JarCoin; uses: number }
  | { kind: "pending" }
  | { kind: "expired" }
  | { kind: "failed" }
  | { kind: "unavailable" };

export type RestoreResult =
  | {
      kind: "restored";
      coin: JarCoin & { uses: number; usesLeft: number; spentAt?: string };
    }
  | { kind: "unknown" }
  | { kind: "unavailable" };

async function getSiteOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "laundro.cafe";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.endsWith("localhost") || host.includes("localhost:")
      ? "http"
      : "https");
  return `${protocol}://${host}`;
}

/** Open a Stripe Checkout Session for a tip of `cents` that carries the hash of token `code` and, on the payment's receipt, the code and its restore link in the visitor's `locale`; return its id and client secret, `invalid` when `cents` is out of range or `code` is not a token code, `unavailable` when Stripe is not configured. */
export async function startTip(options: {
  cents: number;
  code: string;
  locale: string;
}): Promise<StartTipResult> {
  const { cents } = options;
  const code =
    typeof options.code === "string" ? parseTokenCode(options.code) : undefined;
  if (
    !Number.isInteger(cents) ||
    cents < CUSTOM_TIP_CENTS.min ||
    cents > CUSTOM_TIP_CENTS.max ||
    code === undefined
  ) {
    return { kind: "invalid" };
  }
  const copy = getLaundromatCopy(
    (typeof options.locale === "string"
      ? parseLaundromatLocale(options.locale)
      : undefined) ?? DEFAULT_LAUNDROMAT_LOCALE
  );
  const origin = await getSiteOrigin();
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
    metadata: { token_hash: await hashTokenCode(code) },
    payment_intent_data: {
      description: copy.tip.receiptDescription({
        code,
        link: `${origin}/${TOKEN_CODE_HASH_PREFIX}${code}`,
      }),
    },
    return_url: `${origin}/?tip_session={CHECKOUT_SESSION_ID}`,
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

/** Return whether the tip in Checkout Session `sessionId` is paid, with its coin and its token's uses, recording the coin in the jar the first time it is, still pending, failed, expired (also when Stripe has no such session), or `unavailable` when Stripe or the database is not configured. */
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
    return { kind: "paid", coin: fulfilled.coin, uses: fulfilled.uses };
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

/** Return the coin of the tip whose token code is `code`, read leniently as typed by hand, with its token's uses, how many are left and when it was last spent, or `unknown` when no tip has it. */
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

/** Spend one use of the token whose code is `code`, read leniently, on every device, returning the uses it has left; a repeat of the same `attempt` counts as the same spend, `already-spent` when it has no uses left, `unknown` when no tip has it. */
export async function spendToken(options: {
  code: string;
  attempt: string;
  machineId: string;
}): Promise<SpendResult> {
  const code = parseTokenCode(options.code);
  if (
    code === undefined ||
    !ATTEMPT_PATTERN.test(options.attempt) ||
    !isChargeableMachineId(options.machineId)
  ) {
    return { kind: "unknown" };
  }
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "unavailable" };
  return spendTip({
    client,
    tokenHash: await hashTokenCode(code),
    attempt: options.attempt,
    machineId: options.machineId,
  });
}

/** Return which of the first `MAX_CHECKED_ATTEMPTS` `attempts` spent a token into a machine within `GOLDEN_CHARGE_MS.max`, with that machine and how long its charge has left, or `undefined` when the database is not configured. */
export async function checkGoldenCharges(options: {
  attempts: string[];
}): Promise<GoldenSpend[] | undefined> {
  const attempts = (Array.isArray(options?.attempts) ? options.attempts : [])
    .filter(
      (attempt): attempt is string =>
        typeof attempt === "string" && ATTEMPT_PATTERN.test(attempt)
    )
    .slice(0, MAX_CHECKED_ATTEMPTS);
  if (attempts.length === 0) return [];
  const client = createLaundromatServiceClient();
  if (client === undefined) return undefined;
  const now = Date.now();
  const spends = await listGoldenSpends({
    client,
    attempts,
    since: new Date(now - GOLDEN_CHARGE_MS.max),
  });
  return spends.map(({ attempt, machineId, spentAt }) => ({
    attempt,
    machineId,
    remainingMs: Date.parse(spentAt) + GOLDEN_CHARGE_MS.max - now,
  }));
}

/** Return every coin in the tip jar, oldest first, or `undefined` when the database is not configured. */
export async function loadJar(): Promise<JarCoin[] | undefined> {
  const client = createLaundromatServiceClient();
  if (client === undefined) return undefined;
  return listJarCoins({ client });
}
