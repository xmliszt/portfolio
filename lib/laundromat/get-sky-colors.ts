import type { SkyKey } from "./scene-config";

function parseHex(hex: string) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function mixHex(options: { from: string; to: string; amount: number }) {
  const from = parseHex(options.from);
  const to = parseHex(options.to);
  return `#${from
    .map((channel, index) =>
      Math.round(channel + (to[index] - channel) * options.amount)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

/** Return the sky's `top` and `horizon` colours at `hour`, blending linearly between the surrounding `keys` and wrapping past midnight. */
export function getSkyColors(options: { keys: SkyKey[]; hour: number }) {
  const keys = options.keys.toSorted((a, b) => a.hour - b.hour);
  const hour = ((options.hour % 24) + 24) % 24;
  const wrapped = [
    { ...keys[keys.length - 1], hour: keys[keys.length - 1].hour - 24 },
    ...keys,
    { ...keys[0], hour: keys[0].hour + 24 },
  ];
  const nextIndex = wrapped.findIndex((key) => key.hour > hour);
  const from = wrapped[nextIndex - 1];
  const to = wrapped[nextIndex];
  const amount = (hour - from.hour) / (to.hour - from.hour);
  return {
    top: mixHex({ from: from.top, to: to.top, amount }),
    horizon: mixHex({ from: from.horizon, to: to.horizon, amount }),
  };
}
