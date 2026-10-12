import { getDaylitTokens } from "./get-daylit-tokens";
import type { SceneConfig } from "./scene-config";
import { toColorPropertyRules } from "./to-color-property-rules";
import { toTokenProperty } from "./to-token-property";

/** Return CSS that registers each day-lit token as a colour starting at its night value and transitions it over `sky.timeJumpGlideMs` on `[data-lm-daylit]` elements. */
export function getDaylitTokenCss(config: SceneConfig) {
  const nightTokens = getDaylitTokens({
    tokens: config.tokens,
    dayTokens: config.light.dayTokens,
    daylight: 0,
  });
  const names = Object.keys(nightTokens);
  const transition = names
    .map((name) => `${toTokenProperty(name)} ${config.sky.timeJumpGlideMs}ms`)
    .join(", ");
  return `${toColorPropertyRules(nightTokens)}\n[data-lm-daylit] { transition: ${transition}; }`;
}
