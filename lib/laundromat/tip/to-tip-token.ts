import type { StoredTipToken, TipToken } from "./tip-token";

/** Return `token` with its `uses` and `usesLeft`, reading a token stored without them as one use, left unless it has a `spentAt`. */
export function toTipToken(token: StoredTipToken): TipToken {
  return {
    ...token,
    uses: token.uses ?? 1,
    usesLeft: token.usesLeft ?? (token.spentAt === undefined ? 1 : 0),
  };
}
