export const CODE_LENGTH = 6;

/** Return the digits typed or pasted into the code input, keeping at most `CODE_LENGTH` of them. */
export function readCodeInput(value: string) {
  return value.replace(/\D/g, "").slice(0, CODE_LENGTH);
}
