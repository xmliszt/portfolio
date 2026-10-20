import { TOKEN_HASH_PATTERN } from "./token-hash-pattern";

type CheckoutSessionFields = {
  id: string;
  payment_status: string;
  currency: string | null;
  amount_total: number | null;
  metadata: { [key: string]: string } | null;
};

/** Return the session id, amount and token hash to record for `session` when it is a paid SGD tip carrying a valid token hash, or `undefined` when it is not. */
export function getFulfillableTip(session: CheckoutSessionFields) {
  const tokenHash = session.metadata?.token_hash;
  if (
    session.payment_status !== "paid" ||
    session.currency !== "sgd" ||
    session.amount_total === null ||
    tokenHash === undefined ||
    !TOKEN_HASH_PATTERN.test(tokenHash)
  ) {
    return undefined;
  }
  return {
    sessionId: session.id,
    amountCents: session.amount_total,
    tokenHash,
  };
}
