const channels = (hex: string) =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

/** Return the `#rrggbb` colour `amount` (0–1) of the way from `from` to `to`. */
export function mixHex(options: { from: string; to: string; amount: number }) {
  const a = channels(options.from);
  const b = channels(options.to);
  return `#${a
    .map((value, i) =>
      Math.round(value + (b[i] - value) * options.amount)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}
