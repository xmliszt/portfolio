import assert from "node:assert/strict";
import { test } from "node:test";

import { toSavedCat } from "./to-saved-cat";

const LOOK = {
  coat: "ginger",
  pattern: "tabby",
  belly: "cream",
  pads: "pink",
  size: "small",
  fluff: "medium",
  tail: "large",
  ears: "medium",
};
const VOICE = { age: "kitten", voice: "squeaky", mood: "chatty" };

test("reads the look and voice of a row", () => {
  assert.deepEqual(toSavedCat({ look: LOOK, voice: VOICE, extra: 1 }), {
    look: LOOK,
    voice: VOICE,
  });
});

test("drops a malformed row", () => {
  assert.equal(
    toSavedCat({ look: { coat: "plaid" }, voice: VOICE }),
    undefined
  );
  assert.equal(toSavedCat(null), undefined);
});
