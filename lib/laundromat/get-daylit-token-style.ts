import { getDaylitTokens } from "./get-daylit-tokens";
import { getTimeOfDay } from "./get-time-of-day";
import type { SceneConfig } from "./scene-config";
import { toTokenProperty } from "./to-token-property";

/** Return the `--lm-*` custom properties of the day-lit tokens at `hour`, or the night values when `hour` is `undefined`. */
export function getDaylitTokenStyle(options: {
  config: SceneConfig;
  hour: number | undefined;
}) {
  const { config, hour } = options;
  const daylight =
    hour === undefined ? 0 : getTimeOfDay({ hour, config }).daylight;
  const tokens = getDaylitTokens({
    tokens: config.tokens,
    dayTokens: config.light.dayTokens,
    daylight,
  });
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [
      toTokenProperty(name),
      value,
    ])
  );
}
