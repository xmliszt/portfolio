import assert from "node:assert/strict";
import { test } from "node:test";

import { getContrastingInk } from "./get-contrasting-ink";

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const unit = parseInt(hex.slice(start, start + 2), 16) / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

test("every ink stands out on every skin as far as navy or paper can", () => {
  const skins = ["#f7cdb8", "#e8a98a", "#c58260", "#a96a4b", "#6c3f2b"];
  const inks = ["#ffe800", "#82d8d5", "#ff48b0", "#3d5588", "#765ba7"];
  for (const background of skins) {
    for (const ink of inks) {
      const shown = getContrastingInk({ ink, background, minContrast: 4.5 });
      const best = Math.max(
        contrast("#2b3a63", background),
        contrast("#faf6ec", background)
      );
      assert.ok(
        contrast(shown, background) >= Math.min(4.5, best) - 0.05,
        `${ink} on ${background} became ${shown}`
      );
    }
  }
});

test("an ink that already stands out is kept", () => {
  assert.equal(
    getContrastingInk({
      ink: "#3d5588",
      background: "#f7cdb8",
      minContrast: 4.5,
    }),
    "#3d5588"
  );
});
