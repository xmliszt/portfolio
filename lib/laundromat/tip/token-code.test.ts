import assert from "node:assert/strict";
import { test } from "node:test";

import { createTokenCode } from "./create-token-code";
import { parseTokenCode } from "./parse-token-code";

const code = createTokenCode(
  new Uint8Array([3, 40, 15, 9, 7, 26, 29, 2, 22, 8])
);

test("writes a prefixed code in two groups with a checksum", () => {
  assert.match(code, /^LC1\.[0-9A-Z]{5}-[0-9A-Z]{5}-[0-9A-F]{2}$/);
});

test("reads back a code typed by hand", () => {
  assert.equal(parseTokenCode(code), code);
  assert.equal(parseTokenCode(code.toLowerCase().replaceAll("-", " ")), code);
  assert.equal(parseTokenCode(`\n${code}\n`), code);
  assert.equal(parseTokenCode(` ${code}.`), code);
  assert.equal(parseTokenCode(code.replace(".", " ")), code);
});

test("rejects a code with a typo", () => {
  const typo = code.replace(/\.(.)/, (_, character) =>
    character === "3" ? ".4" : ".3"
  );
  assert.equal(parseTokenCode(typo), undefined);
  assert.equal(parseTokenCode("LC1.12345"), undefined);
});
