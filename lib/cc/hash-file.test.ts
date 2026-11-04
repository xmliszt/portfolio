import assert from "node:assert/strict";
import { test } from "node:test";

import { hashFile } from "./hash-file";

test("returns the SHA-256 of the file bytes as lowercase hex", async () => {
  assert.equal(
    await hashFile(new File(["abc"], "a.txt")),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  );
});
