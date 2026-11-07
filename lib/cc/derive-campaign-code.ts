/** Return the first three ASCII letters and digits of `name` in upper case, or `"CMP"` when `name` has fewer than two. */
export function deriveCampaignCode(name: string) {
  const letters = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return letters.length >= 2 ? letters.slice(0, 3) : "CMP";
}
