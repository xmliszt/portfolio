import { mixHexColors } from "./mix-hex-colors";
import type { DaylitToken, SceneConfig } from "./scene-config";

/** Return each `DaylitToken` mixed from its night value in `tokens` toward its value in `dayTokens` by `daylight` (0–1). */
export function getDaylitTokens(options: {
  tokens: SceneConfig["tokens"];
  dayTokens: SceneConfig["light"]["dayTokens"];
  daylight: number;
}) {
  const { tokens, dayTokens, daylight } = options;
  function mix(token: DaylitToken) {
    return mixHexColors({
      from: tokens[token],
      to: dayTokens[token],
      amount: daylight,
    });
  }
  return {
    edge: mix("edge"),
    face: mix("face"),
    faceTop: mix("faceTop"),
    wall: mix("wall"),
    wall2: mix("wall2"),
    shade1: mix("shade1"),
    shade2: mix("shade2"),
    recess: mix("recess"),
    line: mix("line"),
    detail: mix("detail"),
  } satisfies SceneConfig["light"]["dayTokens"];
}
