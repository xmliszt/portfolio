import { CUSTOM_TIP_CENTS } from "./tip-amounts";

/** Return the dollar amount typed in `text` in cents, or `undefined` when it is not a number inside `CUSTOM_TIP_CENTS`. */
export function parseCustomTip(text: string) {
  const trimmed = text.trim().replace(/^S?\$/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return undefined;
  const cents = Math.round(Number(trimmed) * 100);
  return cents >= CUSTOM_TIP_CENTS.min && cents <= CUSTOM_TIP_CENTS.max
    ? cents
    : undefined;
}
