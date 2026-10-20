import assert from "node:assert/strict";
import { test } from "node:test";

import { readTokenLinkText } from "./read-token-link-text";

test("reads the code after #token=", () => {
  assert.equal(
    readTokenLinkText("#token=LC1.ABCDE-FGHJK-12"),
    "LC1.ABCDE-FGHJK-12"
  );
  assert.equal(readTokenLinkText("#token=LC1%2EABCDE"), "LC1.ABCDE");
});

test("keeps malformed percent-encoding instead of throwing", () => {
  assert.equal(readTokenLinkText("#token=%"), "%");
});

test("ignores other hashes", () => {
  assert.equal(readTokenLinkText("#ticket=LT1.x"), "");
  assert.equal(readTokenLinkText(""), "");
});
