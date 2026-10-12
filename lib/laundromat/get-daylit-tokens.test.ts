import assert from "node:assert/strict";
import { test } from "node:test";

import { getDaylitTokens } from "./get-daylit-tokens";
import { sceneConfig } from "./scene-config";

const { tokens } = sceneConfig;
const { dayTokens } = sceneConfig.light;

test("keeps the night tokens with no daylight", () => {
  assert.deepEqual(
    getDaylitTokens({ tokens, dayTokens, daylight: 0 }),
    Object.fromEntries(
      Object.entries(tokens).filter(([name]) => name in dayTokens)
    )
  );
});

test("uses the day tokens in full daylight", () => {
  assert.deepEqual(
    getDaylitTokens({ tokens, dayTokens, daylight: 1 }),
    dayTokens
  );
});

test("mixes from the night token toward the day token", () => {
  const lit = getDaylitTokens({
    tokens: { ...tokens, face: "#000000" },
    dayTokens: { ...dayTokens, face: "#204060" },
    daylight: 0.5,
  });
  assert.equal(lit.face, "#102030");
});
