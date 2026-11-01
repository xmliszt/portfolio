import assert from "node:assert/strict";
import { test } from "node:test";

import { buildLook } from "@/lib/paws/sim/testing/build-look";

import { CAT_LOOK_CODE_FIELDS } from "./cat-look-code-fields";
import { decodeCatLook } from "./decode-cat-look";
import { encodeCatLook } from "./encode-cat-look";

test("reads back the look it encodes", () => {
  const look = buildLook({
    coat: "black",
    pattern: "colorpoint",
    belly: "light",
    pads: "mixed",
    size: "large",
    tailShape: "hook",
    ears: "small",
  });
  assert.deepEqual(decodeCatLook(encodeCatLook(look)), look);
});

test("spells a look in nine characters", () => {
  assert.equal(encodeCatLook(buildLook()), "010011101");
});

test("refuses a code of the wrong length or with an option out of range", () => {
  assert.equal(decodeCatLook("01001110"), undefined);
  assert.equal(decodeCatLook("0100111010"), undefined);
  assert.equal(decodeCatLook("z10011101"), undefined);
  assert.equal(decodeCatLook("0-0011101"), undefined);
});

test("refuses a code whose tail shape is out of range", () => {
  assert.equal(decodeCatLook("010011191"), undefined);
});

test("keeps every option at the index old links point to", () => {
  assert.deepEqual(
    CAT_LOOK_CODE_FIELDS.map(({ field, options }) => [field, options]),
    [
      [
        "coat",
        [
          "ginger",
          "cinnamon",
          "chocolate",
          "cream",
          "peach",
          "white",
          "lilac",
          "blueGrey",
          "charcoal",
          "black",
        ],
      ],
      ["pattern", ["solid", "tabby", "tuxedo", "calico", "colorpoint"]],
      ["belly", ["cream", "white", "coat", "light"]],
      ["pads", ["pink", "black", "mauve", "mixed"]],
      ["size", ["small", "medium", "large"]],
      ["fluff", ["small", "medium", "large"]],
      ["tail", ["small", "medium", "large"]],
      ["tailShape", ["slim", "plume", "wave", "hook"]],
      ["ears", ["small", "medium", "large"]],
    ]
  );
});
