import assert from "node:assert/strict";
import { test } from "node:test";

import { hashTokenCode } from "./hash-token-code";
import { parseTokenCode } from "./parse-token-code";

test("hashes a code as lowercase hex SHA-256", async () => {
  assert.equal(
    await hashTokenCode("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});

test("hashes a hand-typed code the same as its canonical form", async () => {
  const canonical = "LC1.73NCY-5JT9E-12";
  const typed = parseTokenCode("lc1 73ncy 5jt9e 12");
  assert.equal(typed, canonical);
  assert.equal(await hashTokenCode(typed), await hashTokenCode(canonical));
});
