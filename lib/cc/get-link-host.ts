/** Return the host of `link` without a leading "www.", or `undefined` when `link` is empty or not a full URL. */
export function getLinkHost(link: string | null | undefined) {
  if (!link) return undefined;
  try {
    return new URL(link).host.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
