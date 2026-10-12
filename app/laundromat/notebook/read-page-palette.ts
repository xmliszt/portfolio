import type { PagePalette } from "./paint-page-texture";

/** Read the notebook colours and the display and mono fonts from the CSS variables on `element`. */
export function readPagePalette(element: Element): PagePalette {
  const style = getComputedStyle(element);
  function read(name: string) {
    return style.getPropertyValue(name).trim();
  }
  return {
    paper: read("--lm-paper"),
    paperRule: read("--lm-paper-rule"),
    inkPen: read("--lm-ink-pen"),
    cover: read("--lm-face-top"),
    coverLine: read("--lm-line"),
    coverInk: read("--lm-ink"),
    displayFont: read("--lm-font-display") || "serif",
    monoFont: read("--lm-font-mono") || "monospace",
  };
}
