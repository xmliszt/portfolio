function toChannels(hex: string) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

/** Return the six-digit hex colour `amount` of the way from `from` to `to`, mixing each sRGB channel linearly. */
export function mixHexColors(options: {
  from: string;
  to: string;
  amount: number;
}) {
  const to = toChannels(options.to);
  return `#${toChannels(options.from)
    .map((channel, index) =>
      Math.round(channel + (to[index] - channel) * options.amount)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}
