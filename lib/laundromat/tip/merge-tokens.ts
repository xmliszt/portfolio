import type { TipToken } from "./tip-token";

/** Return every token in `lists` once per code, the later list winning on a repeat, newest coin first. */
export function mergeTokens(lists: TipToken[][]) {
  const byCode = Object.fromEntries(
    lists.flat().map((token) => [token.code, token])
  );
  return Object.values(byCode).toSorted((a, b) => b.number - a.number);
}
