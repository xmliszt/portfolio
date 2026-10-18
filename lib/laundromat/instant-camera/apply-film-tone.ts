/** Return a copy of RGBA `pixels` toned like instant film, without changing alpha: slightly faded colour, lifted blacks, teal shadows and warm highlights. */
export function applyFilmTone(pixels: Uint8ClampedArray) {
  const toned = new Uint8ClampedArray(pixels);
  for (let i = 0; i < toned.length; i += 4) {
    const r = toned[i] ?? 0;
    const g = toned[i + 1] ?? 0;
    const b = toned[i + 2] ?? 0;
    const lightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const grey = 255 * lightness * 0.06;
    const shadow = Math.max(0, 1 - lightness * 3);
    const highlight = Math.max(0, lightness * 1.6 - 0.5);
    toned[i] = 8 + (r * 0.94 + grey) * 1.04 + highlight * 16 - shadow * 2;
    toned[i + 1] = 10 + (g * 0.94 + grey) * 1.03 + highlight * 7 + shadow * 4;
    toned[i + 2] = 11 + (b * 0.94 + grey) * 0.98 - highlight * 10 + shadow * 5;
  }
  return toned;
}
