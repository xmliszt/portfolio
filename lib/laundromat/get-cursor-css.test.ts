import assert from "node:assert/strict";
import { test } from "node:test";

import { sceneConfig } from "./scene-config";

import { getCursorCss } from "./get-cursor-css";

test("every custom cursor keeps a native fallback", () => {
  const css = getCursorCss(sceneConfig.tokens);
  assert.match(css, /url\("data:image\/svg\+xml,[^"]+"\) 12 12, default;/);
  assert.match(css, /url\("data:image\/svg\+xml,[^"]+"\) 12 12, pointer;/);
  assert.match(css, /url\("data:image\/svg\+xml,[^"]+"\) 12 12, text;/);
});

test("the clickable ring is drawn in the accent colour", () => {
  const css = getCursorCss(sceneConfig.tokens);
  assert.ok(css.includes(encodeURIComponent(sceneConfig.tokens.accent)));
});

test("the native cursor hides only on fine pointers once the drawn cursor is on", () => {
  const css = getCursorCss(sceneConfig.tokens);
  assert.match(
    css,
    /@media \(pointer: fine\) \{ \[data-laundromat-root\]\[data-lm-cursor\]/
  );
});
