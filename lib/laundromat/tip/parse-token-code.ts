import {
  formatTokenCode,
  TOKEN_CODE_ALPHABET,
  TOKEN_CODE_BODY_LENGTH,
} from "./token-code-format";

const LOOKALIKES: { [character: string]: string } = { O: "0", I: "1", L: "1" };

/** Return `text` as a canonical token code, reading lowercase, spaces, line breaks, trailing punctuation and the letters O, I and L as typed by hand, or `undefined` when its length, alphabet or checksum is wrong. */
export function parseTokenCode(text: string) {
  const compact = text
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/^LC1\.?/, "")
    .replace(/[.,;:!?]+$/, "")
    .replace(/[OIL]/g, (character) => LOOKALIKES[character] ?? character);
  if (compact.length !== TOKEN_CODE_BODY_LENGTH + 2) return undefined;
  const body = compact.slice(0, TOKEN_CODE_BODY_LENGTH);
  if ([...body].some((character) => !TOKEN_CODE_ALPHABET.includes(character))) {
    return undefined;
  }
  const code = formatTokenCode(body);
  return code.endsWith(compact.slice(TOKEN_CODE_BODY_LENGTH))
    ? code
    : undefined;
}
