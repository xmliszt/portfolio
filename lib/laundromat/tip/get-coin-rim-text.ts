const MIN_RIM_CHARACTERS = 54;

/** Return `siteName` and `thanks` joined by dots and repeated the whole number of times that comes closest to `MIN_RIM_CHARACTERS`, ending on a dot so the ring closes evenly. */
export function getCoinRimText(options: { siteName: string; thanks: string }) {
  const segment = `${options.siteName} · ${options.thanks} · `;
  const repeats = Math.max(1, Math.round(MIN_RIM_CHARACTERS / segment.length));
  return segment.repeat(repeats);
}
