import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGetCatResponse } from "./parse-get-cat-response";
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
    tailShape: "slim",
    ears: "small",
  },
  voice: { age: "adult", voice: "soft", mood: "chatty" },
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
    parseGetCatResponse({
      kind: "found",
      cat: { ...cat, voice: { age: "adult" } },
    }),
    undefined
  );
  assert.equal(parseGetCatResponse({ kind: "found" }), undefined);
  assert.equal(parseGetCatResponse({ kind: "saved", cat }), undefined);
  assert.equal(parsePutCatResponse({ kind: "none" }), undefined);
  assert.equal(parseGetCatResponse(undefined), undefined);
});
