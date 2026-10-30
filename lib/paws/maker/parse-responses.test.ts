import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGetCatResponse } from "./parse-get-cat-response";
import { parseMeowResponse } from "./parse-meow-response";
import { parsePutCatResponse } from "./parse-put-cat-response";

const cat = {
  look: {
    coat: "ginger",
    pattern: "tabby",
    belly: "cream",
    pads: "pink",
    size: "small",
    fluff: "medium",
    tail: "large",
    ears: "small",
  },
  voice: { age: "adult", voice: "soft", mood: "chatty" },
  meowUrl: "/m.mp3",
  hasOwnMeow: true,
};

test("reads every cat response kind and drops a malformed cat", () => {
  assert.deepEqual(parseGetCatResponse({ kind: "found", cat }), {
    kind: "found",
    cat,
  });
  assert.deepEqual(parseGetCatResponse({ kind: "none" }), { kind: "none" });
  assert.deepEqual(parseGetCatResponse({ kind: "signInRequired" }), {
    kind: "signInRequired",
  });
  assert.deepEqual(parsePutCatResponse({ kind: "saved", cat }), {
    kind: "saved",
    cat,
  });
  assert.deepEqual(parsePutCatResponse({ kind: "invalid" }), {
    kind: "invalid",
  });
  assert.equal(
    parseGetCatResponse({ kind: "found", cat: { ...cat, meowUrl: 3 } }),
    undefined
  );
  assert.equal(parseGetCatResponse({ kind: "found" }), undefined);
  assert.equal(parseGetCatResponse({ kind: "saved", cat }), undefined);
  assert.equal(parsePutCatResponse({ kind: "none" }), undefined);
  assert.equal(parseGetCatResponse(undefined), undefined);
});

test("reads every meow response kind and requires a clip where the contract has one", () => {
  assert.deepEqual(
    parseMeowResponse({ kind: "generated", meowUrl: "/m.mp3" }),
    {
      kind: "generated",
      meowUrl: "/m.mp3",
    }
  );
  assert.deepEqual(parseMeowResponse({ kind: "tooManyAttempts" }), {
    kind: "tooManyAttempts",
  });
  assert.equal(parseMeowResponse({ kind: "borrowed" }), undefined);
  assert.equal(parseMeowResponse({ kind: "catNotSaved" }), undefined);
  assert.equal(parseMeowResponse("nope"), undefined);
});
