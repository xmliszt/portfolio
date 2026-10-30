import assert from "node:assert/strict";
import { test } from "node:test";

import { getMeowPrompt } from "./get-meow-prompt";

test("fills the template with the text and voice", () => {
  assert.equal(
    getMeowPrompt({ normalizedText: "tiny fart", voice: { age: "old", voice: "deep", mood: "grumpy" } }),
    "tiny fart, made by an old cat, deep, grumpy, one short sound, close mic, no background, no music"
  );
});
