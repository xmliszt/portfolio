import { CLICKABLE_SELECTOR, TEXT_SELECTOR } from "./cursor-selectors";
import type { SceneConfig } from "./scene-config";

const SIZE = 24;
const CENTER = SIZE / 2;

function toCursorUrl(body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${CENTER} ${CENTER}`;
}

/** Return the CSS that gives the laundromat under `[data-laundromat-root]` a dot cursor, a ringed dot over anything clickable and a thin line over text, drawn in `tokens` colours with the native cursors as fallback, and hides them all on fine pointers once `[data-lm-cursor]` marks the drawn cursor as active. */
export function getCursorCss(tokens: SceneConfig["tokens"]) {
  const dot = toCursorUrl(
    `<circle cx="${CENTER}" cy="${CENTER}" r="3.2" fill="${tokens.inkHi}" stroke="${tokens.bg}" stroke-opacity="0.5" stroke-width="1.5"/>`
  );
  const ring = toCursorUrl(
    `<circle cx="${CENTER}" cy="${CENTER}" r="7.5" fill="none" stroke="${tokens.bg}" stroke-opacity="0.4" stroke-width="3"/><circle cx="${CENTER}" cy="${CENTER}" r="7.5" fill="none" stroke="${tokens.accent}" stroke-width="1.1"/><circle cx="${CENTER}" cy="${CENTER}" r="1.8" fill="${tokens.accent}"/>`
  );
  const beam = toCursorUrl(
    `<line x1="${CENTER}" y1="4" x2="${CENTER}" y2="20" stroke="${tokens.inkHi}" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/><line x1="${CENTER}" y1="4" x2="${CENTER}" y2="20" stroke="${tokens.inkPen}" stroke-width="1.1" stroke-linecap="round"/>`
  );
  const root = "[data-laundromat-root]";
  return [
    `${root} { cursor: ${dot}, default; }`,
    `${root} * { cursor: inherit; }`,
    `${root} :is(${CLICKABLE_SELECTOR}) { cursor: ${ring}, pointer; }`,
    `${root} :is(${TEXT_SELECTOR}) { cursor: ${beam}, text; }`,
    `@media (pointer: fine) { ${root}[data-lm-cursor], ${root}[data-lm-cursor] * { cursor: none !important; } }`,
  ].join("\n");
}
