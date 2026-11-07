/** Return `value` trimmed and upper-cased when it is 2–4 ASCII letters or digits, or `undefined` otherwise. */
export function normaliseCampaignCode(value: string) {
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]{2,4}$/.test(code) ? code : undefined;
}
