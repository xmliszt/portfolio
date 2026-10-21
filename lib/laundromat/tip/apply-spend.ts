import type { TipToken } from "./tip-token";

/** Return `token` after a spend the server answered with `spentAt` and `usesLeft`, never raising its `usesLeft` or moving its `spentAt` earlier. */
export function applySpend(options: {
  token: TipToken;
  spentAt: string;
  usesLeft: number;
}): TipToken {
  const { token } = options;
  return {
    ...token,
    spentAt:
      token.spentAt !== undefined && token.spentAt > options.spentAt
        ? token.spentAt
        : options.spentAt,
    usesLeft: Math.min(token.usesLeft, options.usesLeft),
  };
}
