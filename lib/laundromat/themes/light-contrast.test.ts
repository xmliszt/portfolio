import assert from "node:assert/strict";
import { test } from "node:test";

import { themes } from "./themes";

function luminance(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function composite(options: {
  foreground: string;
  background: string;
  opacity: number;
}) {
  return `#${[1, 3, 5]
    .map((start) => {
      const foreground = Number.parseInt(
        options.foreground.slice(start, start + 2),
        16
      );
      const background = Number.parseInt(
        options.background.slice(start, start + 2),
        16
      );
      return Math.round(
        foreground * options.opacity + background * (1 - options.opacity)
      )
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}

test("Light text, accents and illuminated displays keep readable contrast", () => {
  const tokens = themes.light.tokens;
  const glass = composite({
    foreground: tokens.display,
    background: tokens.faceTop,
    opacity: 0.85,
  });
  const pairs = [
    { foreground: tokens.ink, background: tokens.panel },
    {
      foreground: composite({
        foreground: tokens.ink,
        background: tokens.housingBottom,
        opacity: 0.8,
      }),
      background: tokens.housingBottom,
    },
    { foreground: tokens.accent, background: tokens.panel },
    { foreground: tokens.accentInk, background: tokens.accent },
    { foreground: tokens.glow, background: tokens.display },
    { foreground: tokens.glowHi, background: glass },
  ];
  for (const pair of pairs) {
    const foreground = luminance(pair.foreground);
    const background = luminance(pair.background);
    const ratio =
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05);
    assert.ok(
      ratio >= 4.5,
      `${pair.foreground} on ${pair.background}: ${ratio.toFixed(2)}:1`
    );
  }
});
