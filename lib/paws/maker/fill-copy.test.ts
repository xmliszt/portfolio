import assert from "node:assert/strict";
import { test } from "node:test";

import { COPY } from "@/lib/paws/copy";

import { fillCopy } from "./fill-copy";

test("fills named values and leaves unknown names", () => {
  assert.equal(
    fillCopy({ template: COPY.signIn.codeSent, values: { email: "a@b.co" } }),
    "Enter the code we sent to a@b.co."
  );
  assert.equal(fillCopy({ template: "{a} {b}", values: { a: "x" } }), "x {b}");
});

test("does not read names from the object prototype", () => {
  assert.equal(fillCopy({ template: "{toString}", values: {} }), "{toString}");
});
