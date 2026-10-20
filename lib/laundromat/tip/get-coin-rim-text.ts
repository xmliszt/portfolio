const MIN_RIM_CHARACTERS = 54;

/** Return `siteName` and `thanks` joined by dots and repeated until the text is at least `MIN_RIM_CHARACTERS` long, ending on a dot so the ring closes evenly. */
export function getCoinRimText(options: { siteName: string; thanks: string }) {
  const segment = `${options.siteName} · ${options.thanks} · `;
  const repeats = Math.max(1, Math.ceil(MIN_RIM_CHARACTERS / segment.length));
  return segment.repeat(repeats);
}
