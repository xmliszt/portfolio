"use client";

import { useLayoutEffect } from "react";

import { getCursorCss } from "@/lib/laundromat/get-cursor-css";
import { getDaylitTokenCss } from "@/lib/laundromat/get-daylit-token-css";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import type { ThemeId } from "@/lib/laundromat/themes/themes";
import { themes } from "@/lib/laundromat/themes/themes";
import { toCssVariables } from "@/lib/laundromat/to-css-variables";

type SceneThemeStyleProps = { config: SceneConfig; themeId: ThemeId };

export function SceneThemeStyle(props: SceneThemeStyleProps) {
  const background = props.config.tokens.bg;
  const theme = themes[props.themeId];
  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta === null) return;
    const previous = meta.getAttribute("content");
    meta.setAttribute("content", background);
    return () => {
      if (previous === null) meta.removeAttribute("content");
      else meta.setAttribute("content", previous);
    };
  }, [background]);

  useLayoutEffect(() => {
    const root = document.querySelector("[data-laundromat-root]");
    if (root === null) return;
    root.setAttribute("data-theme-changing", "");
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() =>
        root.removeAttribute("data-theme-changing")
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      root.removeAttribute("data-theme-changing");
    };
  }, [props.themeId]);

  return (
    <style>{`[data-laundromat-root] { color-scheme: ${theme.colorScheme}; ${toCssVariables(props.config.tokens)} --lm-panel-shadow: ${theme.panelShadow}; --lm-backdrop: ${theme.backdrop}; }\n${getDaylitTokenCss(props.config)}\n[data-theme-changing] [data-lm-daylit] { transition: none; }\n${getCursorCss(props.config.tokens)}`}</style>
  );
}
