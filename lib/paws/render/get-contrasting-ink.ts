const DARK = [43, 58, 99] as const;
const LIGHT = [250, 246, 236] as const;
const STEPS = 10;

function toRgb(hex: string) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function toHex(rgb: number[]) {
  return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function getLuminance(rgb: number[]) {
  const [r, g, b] = rgb.map((value) => {
    const unit = value / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrast(a: number[], b: number[]) {
  const [high, low] = [getLuminance(a), getLuminance(b)].toSorted(
    (x, y) => y - x
  );
  return (high + 0.05) / (low + 0.05);
}

/** Return `ink` mixed toward navy or paper, whichever stands out more on `background`, by the smallest step that reaches `minContrast` against it (or the full navy or paper when none does); `ink` unchanged when it already does. */
export function getContrastingInk(options: {
  ink: string;
  background: string;
  minContrast: number;
}) {
  const ink = toRgb(options.ink);
  const background = toRgb(options.background);
  const target =
    getContrast([...DARK], background) >= getContrast([...LIGHT], background)
      ? DARK
      : LIGHT;
  const mixed = Array.from({ length: STEPS + 1 }, (_, step) =>
    ink.map((value, index) => value + (target[index] - value) * (step / STEPS))
  ).find(
    (candidate) => getContrast(candidate, background) >= options.minContrast
  );
  return toHex(mixed ?? [...target]);
}
