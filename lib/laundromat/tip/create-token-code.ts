import {
  formatTokenCode,
  TOKEN_CODE_ALPHABET,
  TOKEN_CODE_BODY_LENGTH,
} from "./token-code-format";

/** Return a new token code built from the first 10 of `randomValues`, each mapped onto the Crockford base32 alphabet. */
export function createTokenCode(randomValues: Uint8Array) {
  const body = Array.from(
    randomValues.slice(0, TOKEN_CODE_BODY_LENGTH),
    (value) => TOKEN_CODE_ALPHABET[value % TOKEN_CODE_ALPHABET.length]
  ).join("");
  return formatTokenCode(body);
}
